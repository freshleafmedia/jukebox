<?php

$statement = Db::connect()->prepare('SELECT id FROM songs WHERE queued_by IS NOT NULL AND state IN (?, ?) ORDER BY sort LIMIT 1');
$statement->execute([SongState::PLAYING->value, SongState::PAUSED->value]);
$values = $statement->fetchAll(PDO::FETCH_COLUMN);
$currentlyPlayingSongId = $values[0] ?? false;

if ($currentlyPlayingSongId === false) {
    $statement = Db::connect()->prepare('SELECT id FROM songs WHERE queued_by IS NOT NULL AND state = ? ORDER BY sort LIMIT 1');
    $statement->execute([SongState::PLAYABLE->value]);
    $values = $statement->fetchAll(PDO::FETCH_COLUMN);
    $songIdToPlay = $values[0] ?? false;
} else {
    $songIdToPlay = $currentlyPlayingSongId;
}

if ($songIdToPlay !== false) {
    Db::connect()
        ->prepare('UPDATE songs SET state = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        ->execute([SongState::PLAYING->value, $songIdToPlay]);
}

http_response_code(200);
