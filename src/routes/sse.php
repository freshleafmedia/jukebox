<?php

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('X-Accel-Buffering: no');

ignore_user_abort(false);
set_time_limit(0);

while (ob_get_level() > 0) {
    ob_end_clean();
}

function sendSseData(string $data): void
{
    foreach (explode("\n", $data) as $line) {
        echo 'data: ' . $line . "\n";
    }

    echo "\n";

    flush();
}

$signatureStatement = db()->prepare(
    'SELECT group_concat(id || \':\' || state || \':\' || queued_by || \':\' || sort, \'|\')
     FROM (SELECT id, state, queued_by, sort FROM songs WHERE queued_by IS NOT NULL ORDER BY sort)',
);

$lastSignature = false;

while (!connection_aborted()) {
    $signatureStatement->execute();
    $signature = $signatureStatement->fetchColumn();

    if ($signature !== $lastSignature) {
        $lastSignature = $signature;

        ob_start();
        require __DIR__ . '/../views/media-controls.php';
        $controlsHtml = ob_get_clean();

        ob_start();
        require __DIR__ . '/../views/queue-list.php';
        $queueHtml = ob_get_clean();

        sendSseData(
            '<hx-partial hx-target="#mediaControls">' . $controlsHtml . '</hx-partial>' . "\n"
            . '<hx-partial hx-target="#queueContainer">' . $queueHtml . '</hx-partial>',
        );
    } else {
        echo ": keep-alive\n\n";
        flush();
    }

    sleep(1);
}
