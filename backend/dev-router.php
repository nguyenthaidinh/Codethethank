<?php

// Local PHP development server only. Serve public Admin assets without opening a DB session.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$assets = [
    '/admin/assets/app.css' => ['app.css', 'text/css; charset=utf-8'],
    '/admin/assets/app.js' => ['app.js', 'application/javascript; charset=utf-8'],
    '/admin/assets/serif-normal.woff2' => ['serif-normal.woff2', 'font/woff2'],
    '/admin/assets/serif-italic.woff2' => ['serif-italic.woff2', 'font/woff2'],
];
if (isset($assets[$path])) {
    [$file, $type] = $assets[$path];
    header('Content-Type: '.$type);
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: no-cache');
    readfile(__DIR__.'/public/admin/'.$file);

    return true;
}
require __DIR__.'/public/index.php';
