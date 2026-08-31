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

$statement = Db::connect()->prepare('SELECT id FROM songs WHERE youtube_id = ?');
$statement->execute([$youtubeId]);
$song = $statement->fetchAll()[0] ?? false;

$sortValues = Db::connect()->query('SELECT COALESCE(MAX(sort), -1) + 1 FROM songs WHERE queued_by IS NOT NULL')->fetchAll(PDO::FETCH_COLUMN);
$nextSort = (int) $sortValues[0];

$queuedBy = substr(trim($_POST['queued_by'] ?? ''), 0, 50);

if ($queuedBy === '' || $queuedBy === 'null') {
    $queuedBy = 'Someone';
}

if ($song === false) {
    Db::connect()
        ->prepare('INSERT INTO songs (youtube_id, title, duration, queued_by, state, sort, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)')
        ->execute([$youtubeId, $info->title, $info->duration, $queuedBy, 'download_required', $nextSort]);
} else {
    Db::connect()
        ->prepare('UPDATE songs SET queued_by = ?, sort = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        ->execute([$queuedBy, $nextSort, $song['id']]);
}

http_response_code(200);
