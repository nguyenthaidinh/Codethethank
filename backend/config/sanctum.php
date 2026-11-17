<?php

return [
    'stateful' => [],
    'guard' => [],
    'expiration' => (int) env('STAFF_TOKEN_MINUTES', 480),
    'token_prefix' => 'uwl_',
    'routes' => false,
];
