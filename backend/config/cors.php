<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['GET', 'POST', 'DELETE', 'OPTIONS'],
    'allowed_origins' => array_values(array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', ''))))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Accept', 'Content-Type', 'Authorization', 'Idempotency-Key', 'X-Receipt-Token'],
    'exposed_headers' => ['Retry-After'],
    'max_age' => 600,
    'supports_credentials' => false,
];
