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

$signatureStatement = Db::connect()->prepare('SELECT MAX(updated_at) FROM songs WHERE queued_by IS NOT NULL');

$lastSignature = false;

while (!connection_aborted()) {
    $loopStartedAt = microtime(true);

    $signatureStatement->execute();
    $signature = $signatureStatement->fetchColumn();

    $partials = '';

    if ($signature !== $lastSignature) {
        $lastSignature = $signature;

        ob_start();
        require __DIR__ . '/../views/media-controls.php';
        $controlsHtml = ob_get_clean();

        ob_start();
        require __DIR__ . '/../views/queue-list.php';
        $queueHtml = ob_get_clean();

        $partials .= '<hx-partial hx-target="#mediaControls">' . $controlsHtml . '</hx-partial>' . "\n"
            . '<hx-partial hx-target="#queueContainer">' . $queueHtml . '</hx-partial>' . "\n";
    }

    $updateTime = microtime(true) - $loopStartedAt;

    ob_start();
    require __DIR__ . '/../views/debug-update-time.php';
    $debugHtml = ob_get_clean();

    $partials .= '<hx-partial hx-target="#debugUpdateTime">' . $debugHtml . '</hx-partial>';

    sendSseData($partials);

    usleep(100_000);
}
