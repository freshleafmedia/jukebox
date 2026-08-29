<?php

$youtubeId = $_POST['youtube_id'] ?? null;

if ($youtubeId === null) {
    http_response_code(400);
    return;
}

$youtube = new YoutubeApi();

try {
    $info = $youtube->videoInfo($youtubeId);
} catch (RuntimeException) {
    http_response_code(502);
    return;
}

if ($info === null) {
    http_response_code(404);
    return;
}

$statement = db()->prepare('SELECT id FROM songs WHERE youtube_id = ?');
$statement->execute([$youtubeId]);
$song = $statement->fetch();

$nextSort = (int) db()
    ->query('SELECT COALESCE(MAX(sort), -1) + 1 FROM songs WHERE queued_by IS NOT NULL')
    ->fetchColumn();

$queuedBy = 'Someone';

if ($song === false) {
    db()
        ->prepare('INSERT INTO songs (youtube_id, title, duration, queued_by, state, sort) VALUES (?, ?, ?, ?, ?, ?)')
        ->execute([$youtubeId, $info->title, $info->duration, $queuedBy, 'download_required', $nextSort]);
} else {
    db()
        ->prepare('UPDATE songs SET queued_by = ?, sort = ? WHERE id = ?')
        ->execute([$queuedBy, $nextSort, $song['id']]);
}

header('HX-Redirect: /');
http_response_code(200);
