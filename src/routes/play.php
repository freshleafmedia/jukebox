<?php

$statement = db()->prepare('SELECT id FROM songs WHERE queued_by IS NOT NULL AND state IN (?, ?) ORDER BY sort LIMIT 1');
$statement->execute([SongState::PLAYING->value, SongState::PAUSED->value]);
$currentlyPlayingSongId = $statement->fetchColumn();

if ($currentlyPlayingSongId === false) {
    $statement = db()->prepare('SELECT id FROM songs WHERE queued_by IS NOT NULL AND state = ? ORDER BY sort LIMIT 1');
    $statement->execute([SongState::PLAYABLE->value]);
    $songIdToPlay = $statement->fetchColumn();
} else {
    $songIdToPlay = $currentlyPlayingSongId;
}

if ($songIdToPlay !== false) {
    db()
        ->prepare('UPDATE songs SET state = ? WHERE id = ?')
        ->execute([SongState::PLAYING->value, $songIdToPlay]);
}

http_response_code(200);
