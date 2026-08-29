<?php

$statement = db()->prepare('SELECT id FROM songs WHERE queued_by IS NOT NULL AND state IN (?, ?) ORDER BY sort LIMIT 1');
$statement->execute([SongState::Playing->value, SongState::Paused->value]);
$currentlyPlayingSongId = $statement->fetchColumn();

if ($currentlyPlayingSongId === false) {
    $statement = db()->prepare('SELECT id FROM songs WHERE queued_by IS NOT NULL AND state = ? ORDER BY sort LIMIT 1');
    $statement->execute([SongState::Playable->value]);
    $songIdToPlay = $statement->fetchColumn();
} else {
    $songIdToPlay = $currentlyPlayingSongId;
}

if ($songIdToPlay !== false) {
    db()
        ->prepare('UPDATE songs SET state = ? WHERE id = ?')
        ->execute([SongState::Playing->value, $songIdToPlay]);
}

header('HX-Redirect: /');
http_response_code(200);
