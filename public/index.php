<?php

require __DIR__ . '/../config.php';
require __DIR__ . '/../database.php';
require __DIR__ . '/../helpers.php';
require __DIR__ . '/../src/Cache.php';
require __DIR__ . '/../src/SearchResult.php';
require __DIR__ . '/../src/VideoInfo.php';
require __DIR__ . '/../src/YoutubeApi.php';
require __DIR__ . '/../src/SongState.php';
require __DIR__ . '/../src/Song.php';
require __DIR__ . '/../src/VlcCommand.php';
require __DIR__ . '/../src/VlcRemote.php';

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($path !== rtrim($path, '/') && $path !== '/') {
    header('Location: ' . rtrim($path, '/'), response_code: 308);
    exit;
}

match (true) {
    $path === '/' => require __DIR__ . '/../src/routes/jukebox.php',
    $path === '/action/search' => require __DIR__ . '/../src/routes/search.php',
    $path === '/action/queue-song' => require __DIR__ . '/../src/routes/queue-song.php',
    $path === '/action/play' => require __DIR__ . '/../src/routes/play.php',
    $path === '/action/pause' => require __DIR__ . '/../src/routes/pause.php',
    $path === '/action/skip' => require __DIR__ . '/../src/routes/skip.php',
    $path === '/action/volume-up' => require __DIR__ . '/../src/routes/volume-up.php',
    $path === '/action/volume-down' => require __DIR__ . '/../src/routes/volume-down.php',
    $path === '/action/shuffle' => require __DIR__ . '/../src/routes/shuffle.php',
    $path === '/sse' => require __DIR__ . '/../src/routes/sse.php',
    default => http_response_code(404),
};
