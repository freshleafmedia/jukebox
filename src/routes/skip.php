<?php

$statement = Db::connect()->prepare('SELECT id FROM songs WHERE queued_by IS NOT NULL AND state IN (?, ?) ORDER BY sort LIMIT 1');
$statement->execute([SongState::PLAYING->value, SongState::PAUSED->value]);
$currentlyPlayingSongId = $statement->fetchAll(PDO::FETCH_COLUMN)[0] ?? false;

if ($currentlyPlayingSongId !== false) {
    Db::connect()
        ->prepare('UPDATE songs SET state = ?, queued_by = NULL WHERE id = ?')
        ->execute([SongState::PLAYABLE->value, $currentlyPlayingSongId]);
}

$statement = Db::connect()->prepare('SELECT id FROM songs WHERE queued_by IS NOT NULL AND state = ? ORDER BY sort LIMIT 1');
$statement->execute([SongState::PLAYABLE->value]);
$nextSongId = $statement->fetchAll(PDO::FETCH_COLUMN)[0] ?? false;

if ($nextSongId !== false) {
    Db::connect()
        ->prepare('UPDATE songs SET state = ? WHERE id = ?')
        ->execute([SongState::PLAYING->value, $nextSongId]);
}

http_response_code(200);
