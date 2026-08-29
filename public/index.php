<?php

require __DIR__ . '/../config.php';
require __DIR__ . '/../database.php';
require __DIR__ . '/../helpers.php';

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($path !== rtrim($path, '/') && $path !== '/') {
    header('Location: ' . rtrim($path, '/'), response_code: 308);
    exit;
}

match (true) {
    $path === '/' => require __DIR__ . '/../views/jukebox.php',
    default => http_response_code(404),
};
