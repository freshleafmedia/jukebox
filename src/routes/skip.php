<?php

$statement = db()->prepare('SELECT id FROM songs WHERE queued_by IS NOT NULL AND state IN (?, ?) ORDER BY sort LIMIT 1');
$statement->execute([SongState::Playing->value, SongState::Paused->value]);
$currentlyPlayingSongId = $statement->fetchColumn();

if ($currentlyPlayingSongId !== false) {
    db()
        ->prepare('UPDATE songs SET state = ?, queued_by = NULL WHERE id = ?')
        ->execute([SongState::Playable->value, $currentlyPlayingSongId]);
}

$statement = db()->prepare('SELECT id FROM songs WHERE queued_by IS NOT NULL AND state = ? ORDER BY sort LIMIT 1');
$statement->execute([SongState::Playable->value]);
$nextSongId = $statement->fetchColumn();

if ($nextSongId !== false) {
    db()
        ->prepare('UPDATE songs SET state = ? WHERE id = ?')
        ->execute([SongState::Playing->value, $nextSongId]);
}

header('HX-Redirect: /');
http_response_code(200);
