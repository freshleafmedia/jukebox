<?php

$songIds = Db::connect()
    ->query('SELECT id FROM songs WHERE queued_by IS NOT NULL')
    ->fetchAll(PDO::FETCH_COLUMN);

shuffle($songIds);

$statement = Db::connect()->prepare('UPDATE songs SET sort = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');

Db::connect()->beginTransaction();

foreach ($songIds as $sort => $id) {
    $statement->execute([$sort, $id]);
}

Db::connect()->commit();

http_response_code(200);
