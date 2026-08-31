<?php

$youtubeId = $_POST['youtube_id'] ?? null;
$requestedBy = substr(trim($_POST['requested_by'] ?? ''), 0, 50);

if ($youtubeId === null || $requestedBy === '' || $requestedBy === 'null') {
    http_response_code(400);
    return;
}

$statement = Db::connect()->prepare(
    'SELECT id, queued_by, state FROM songs WHERE youtube_id = ? AND queued_by IS NOT NULL'
);
$statement->execute([$youtubeId]);
$song = $statement->fetch(PDO::FETCH_ASSOC);

if ($song === false) {
    http_response_code(404);
    return;
}

if ($song['queued_by'] !== $requestedBy) {
    http_response_code(403);
    return;
}

if ($song['state'] === SongState::PLAYING->value || $song['state'] === SongState::PAUSED->value) {
    http_response_code(403);
    return;
}

Db::connect()->beginTransaction();

Db::connect()
    ->prepare('UPDATE songs SET queued_by = NULL, sort = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    ->execute([$song['id']]);

$queued = Db::connect()
    ->query('SELECT id, queued_by FROM songs WHERE queued_by IS NOT NULL ORDER BY sort')
    ->fetchAll();

$statement = Db::connect()->prepare('UPDATE songs SET sort = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');

foreach (fairQueueOrder($queued) as $sort => $id) {
    $statement->execute([$sort, $id]);
}

Db::connect()->commit();

http_response_code(200);
