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
$activeSongStatement = Db::connect()->prepare('SELECT id, duration FROM songs WHERE queued_by IS NOT NULL AND state IN (?, ?) ORDER BY sort LIMIT 1');

$lastSignature = false;
$lastPosition = null;

while (!connection_aborted()) {
    $loopStartedAt = microtime(true);

    $signatureStatement->execute();
    $signature = $signatureStatement->fetchColumn();

    $partials = '';

    if ($signature !== $lastSignature) {
        $lastSignature = $signature;

        $partials .= '<hx-partial hx-target="#mediaControls">' . renderView(__DIR__ . '/../views/media-controls.php') . '</hx-partial>' . "\n"
            . '<hx-partial hx-target="#queueContainer">' . renderView(__DIR__ . '/../views/queue-list.php') . '</hx-partial>' . "\n";
    }

    $activeSongStatement->execute([SongState::PLAYING->value, SongState::PAUSED->value]);
    $activeSong = $activeSongStatement->fetchAll()[0] ?? false;

    if ($activeSong !== false) {
        $position = VlcRemote::getPlaybackPosition();

        if ($position !== null && $position !== $lastPosition) {
            $lastPosition = $position;

            $partials .= '<hx-partial hx-target="#playbackProgress" hx-swap="outerHTML"><progress id="playbackProgress" max="' . $activeSong['duration'] . '" value="' . $position . '"></progress></hx-partial>' . "\n";
        }
    }

    if ($partials !== '') {
        $partials .= '<hx-partial hx-target="#debugUpdateTime">' . renderView(__DIR__ . '/../views/debug-update-time.php', ['updateTime' => microtime(true) - $loopStartedAt]) . '</hx-partial>';
    }

    sendSseData($partials);

    usleep(100_000);
}
