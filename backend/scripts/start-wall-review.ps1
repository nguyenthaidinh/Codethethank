param([string]$Php = 'F:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe')
$ErrorActionPreference = 'Stop'
Push-Location (Join-Path $PSScriptRoot '..')
try {
    $env:APP_ENV = 'local'
    $env:DB_DATABASE = 'gratitude_wall_review'
    $env:ADMIN_REVIEW_MODE = 'true'
    $env:APP_CONFIG_CACHE = 'bootstrap/cache/f57-review-config.php'
    $env:APP_ROUTES_CACHE = 'bootstrap/cache/f57-review-routes.php'
    # The isolated database must already exist. Never create/reset game or production data.
    & $Php -d extension=pdo_pgsql artisan config:clear
    if ($LASTEXITCODE -ne 0) { throw 'Cannot clear the review configuration cache.' }
    & $Php -d extension=pdo_pgsql artisan migrate --force
    if ($LASTEXITCODE -ne 0) { throw 'Review migration failed.' }
    foreach ($command in @('config:cache', 'route:cache', 'view:cache')) {
        & $Php -d extension=pdo_pgsql artisan $command
        if ($LASTEXITCODE -ne 0) { throw "Review cache failed: $command" }
    }
    # Restart this process after PHP/template changes: opcode timestamp checks are off locally.
    & $Php -d extension=pdo_pgsql -d zend_extension=opcache -d opcache.enable_cli=1 -d opcache.validate_timestamps=0 -d realpath_cache_size=4096K -d realpath_cache_ttl=600 -S 127.0.0.1:8057 -t public dev-router.php
} finally {
    Pop-Location
}
