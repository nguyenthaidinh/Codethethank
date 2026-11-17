<?php

namespace App\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
use Normalizer;

class SubmitGratitudeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $normalized = [];
        foreach (['recipient', 'message', 'display_name'] as $key) {
            if (is_string($this->input($key))) {
                $normalized[$key] = Normalizer::normalize(str_replace(["\r\n", "\r"], "\n", trim($this->input($key))), Normalizer::FORM_C);
            }
        }
        $this->merge($normalized);
    }

    public function rules(): array
    {
        $printable = function (string $attribute, mixed $value, Closure $fail) {
            if (is_string($value) && preg_match('/[\x{0000}-\x{0008}\x{000B}\x{000C}\x{000E}-\x{001F}\x{007F}-\x{009F}\x{202A}-\x{202E}\x{2066}-\x{2069}]/u', $value)) {
                $fail('Control characters are not allowed.');
            }
        };

        return [
            'recipient' => ['required', 'string', 'max:60', 'not_regex:/[\r\n\t]/u', $printable],
            'message' => ['required', 'string', 'max:500', $printable],
            'display_name' => ['nullable', 'string', 'max:40', 'not_regex:/[\r\n\t]/u', $printable],
            'consent' => ['required', 'array:accepted,version'],
            'consent.accepted' => ['required', function (string $attribute, mixed $value, Closure $fail) {
                if ($value !== true) {
                    $fail('Explicit public sharing consent is required.');
                }
            }],
            'consent.version' => ['required', Rule::in(config('gratitude.consent_versions'))],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator) {
            if (array_diff(array_keys($this->all()), ['recipient', 'message', 'display_name', 'consent'])) {
                $validator->errors()->add('request', 'Unexpected fields. Private drafts and game saves are not accepted.');
            }
            if (! preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/D', $this->header('Idempotency-Key', ''))) {
                $validator->errors()->add('idempotency_key', 'A random UUID v4 Idempotency-Key is required.');
            }
            if (! preg_match('/^[0-9a-f]{64}$/D', $this->header('X-Receipt-Token', ''))) {
                $validator->errors()->add('receipt_token', 'A random 256-bit X-Receipt-Token is required.');
            }
        }];
    }
}
