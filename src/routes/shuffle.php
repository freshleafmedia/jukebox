<?php

$songIds = db()
    ->query('SELECT id FROM songs WHERE queued_by IS NOT NULL')
    ->fetchAll(PDO::FETCH_COLUMN);

shuffle($songIds);

$statement = db()->prepare('UPDATE songs SET sort = ? WHERE id = ?');

db()->beginTransaction();

foreach ($songIds as $sort => $id) {
    $statement->execute([$sort, $id]);
}

db()->commit();

header('HX-Redirect: /');
http_response_code(200);
