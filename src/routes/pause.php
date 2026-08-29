<?php

$statement = Db::connect()->prepare('SELECT id FROM songs WHERE queued_by IS NOT NULL AND state = ? ORDER BY sort LIMIT 1');
$statement->execute([SongState::PLAYING->value]);
$values = $statement->fetchAll(PDO::FETCH_COLUMN);
$currentlyPlayingSongId = $values[0] ?? false;

if ($currentlyPlayingSongId !== false) {
    Db::connect()
        ->prepare('UPDATE songs SET state = ? WHERE id = ?')
        ->execute([SongState::PAUSED->value, $currentlyPlayingSongId]);
}

http_response_code(200);
