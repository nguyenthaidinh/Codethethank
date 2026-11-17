<?php

use App\Http\Middleware\ActiveStaff;
use App\Http\Middleware\AdminAccess;
use App\Http\Middleware\AdminHeaders;
use App\Http\Middleware\AdminSession;
use App\Http\Middleware\ApiBoundary;
use App\Http\Middleware\ApiHeaders;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/admin.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: fn () => require __DIR__.'/../routes/wall.php',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [ApiHeaders::class, ApiBoundary::class]);
        $middleware->web(prepend: [AdminSession::class, AdminHeaders::class]);
        $middleware->alias(['admin.access' => AdminAccess::class, 'staff.active' => ActiveStaff::class]);
        // Admin sessions are confined to /admin; Sanctum API stays bearer-only.
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
        $exceptions->dontFlash(['password', 'password_confirmation', 'message', 'recipient', 'display_name', 'consent']);
        $exceptions->respond(fn (Response $response) => request()->is('admin', 'admin/*') ? AdminHeaders::protect($response) : ApiHeaders::protect($response));
        $exceptions->report(function (QueryException $exception) {
            // QueryException's default message contains bindings, including letter text.
            Log::error('Database operation failed.', ['sqlstate' => $exception->errorInfo[0] ?? 'unknown']);

            return false;
        });
        $exceptions->render(function (QueryException $exception, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Storage temporarily unavailable. Retry with the same submission keys.'], 503);
            }
            if ($request->is('admin', 'admin/*')) {
                return response()->view('admin.error', ['code' => 503, 'message' => 'Chưa thể kết nối kho lời nhắn. Vui lòng thử lại sau.'], 503);
            }
        });
        $exceptions->render(function (HttpExceptionInterface $exception, Request $request) {
            if ($request->is('admin', 'admin/*') && ! $request->expectsJson()) {
                $code = $exception->getStatusCode();
                $message = match ($code) {
                    419 => 'Phiên biểu mẫu đã hết hạn. Vui lòng tải lại trang rồi thử lại.',
                    429 => 'Bạn thao tác quá nhanh. Vui lòng chờ một chút rồi thử lại.',
                    404 => 'Không tìm thấy lời nhắn hoặc trang bạn yêu cầu.',
                    default => $exception->getMessage() ?: 'Không thể thực hiện thao tác này.',
                };

                return response()->view('admin.error', compact('code', 'message'), $code, $exception->getHeaders());
            }
        });
    })->create();
