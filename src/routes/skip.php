<?php

$statement = db()->prepare('SELECT id FROM songs WHERE queued_by IS NOT NULL AND state IN (?, ?) ORDER BY sort LIMIT 1');
$statement->execute([SongState::PLAYING->value, SongState::PAUSED->value]);
$currentlyPlayingSongId = $statement->fetchColumn();

if ($currentlyPlayingSongId !== false) {
    db()
        ->prepare('UPDATE songs SET state = ?, queued_by = NULL WHERE id = ?')
        ->execute([SongState::PLAYABLE->value, $currentlyPlayingSongId]);
}

$statement = db()->prepare('SELECT id FROM songs WHERE queued_by IS NOT NULL AND state = ? ORDER BY sort LIMIT 1');
$statement->execute([SongState::PLAYABLE->value]);
$nextSongId = $statement->fetchColumn();

if ($nextSongId !== false) {
    db()
        ->prepare('UPDATE songs SET state = ? WHERE id = ?')
        ->execute([SongState::PLAYING->value, $nextSongId]);
}

http_response_code(200);
