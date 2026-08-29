<?php

require __DIR__ . '/../config.php';
require __DIR__ . '/../database.php';
require __DIR__ . '/../helpers.php';
require __DIR__ . '/../src/Cache.php';
require __DIR__ . '/../src/SearchResult.php';
require __DIR__ . '/../src/VideoInfo.php';
require __DIR__ . '/../src/YoutubeApi.php';

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($path !== rtrim($path, '/') && $path !== '/') {
    header('Location: ' . rtrim($path, '/'), response_code: 308);
    exit;
}

match (true) {
    $path === '/' => require __DIR__ . '/../src/routes/jukebox.php',
    $path === '/action/search' => require __DIR__ . '/../src/routes/search.php',
    $path === '/action/queue-song' => require __DIR__ . '/../src/routes/queue-song.php',
    default => http_response_code(404),
};
