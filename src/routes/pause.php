<?php

$statement = db()->prepare('SELECT id FROM songs WHERE queued_by IS NOT NULL AND state = ? ORDER BY sort LIMIT 1');
$statement->execute([SongState::PLAYING->value]);
$currentlyPlayingSongId = $statement->fetchColumn();

if ($currentlyPlayingSongId !== false) {
    db()
        ->prepare('UPDATE songs SET state = ? WHERE id = ?')
        ->execute([SongState::PAUSED->value, $currentlyPlayingSongId]);
}

http_response_code(200);
