<?php

$songs = db()
    ->query('SELECT * FROM songs WHERE queued_by IS NOT NULL ORDER BY sort')
    ->fetchAll();

foreach ($songs as $i => $song) {
    if ($song['state'] === 'playing' || $song['state'] === 'paused') {
        array_unshift($songs, ...array_splice($songs, $i, 1));
        break;
    }
}

$activeSong = null;
$nextPlayableSong = null;

foreach ($songs as $song) {
    if ($song['state'] === 'playing' || $song['state'] === 'paused') {
        $activeSong = $song;
    }
    if ($song['state'] === 'playable' && $nextPlayableSong === null) {
        $nextPlayableSong = $song;
    }
}

$activeSong ??= $nextPlayableSong;

function formatDuration(int $seconds): string
{
    $h = intdiv($seconds, 3600);
    $m = intdiv($seconds % 3600, 60);
    $s = $seconds % 60;

    $m = str_pad((string) $m, 2, '0', STR_PAD_LEFT);
    $s = str_pad((string) $s, 2, '0', STR_PAD_LEFT);

    return $h > 0 ? $h . ':' . $m . ':' . $s : $m . ':' . $s;
}

http_response_code(200);

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Freshleaf Jukebox</title>

    <link rel="stylesheet" type="text/css" href="/assets/app.css" media="all">
    <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
    <link href="https://fonts.googleapis.com/css?family=Pacifico|Nunito:400,300,700" rel="stylesheet" type="text/css">
</head>
<body class="playing">
    <div id="background"></div>
    <div id="wrapper">
        <header>
            <div class="masthead">
                <h1>Freshleaf Jukebox</h1>
                <button class="btn" id="addButton">Add Song</button>
            </div>

            <div class="media-controls">
                <button class="btn media" id="playButton" <?= $activeSong === null || $activeSong['state'] === 'playing' ? 'disabled' : '' ?>></button>
                <button class="btn media" id="pauseButton" <?= $activeSong === null || $activeSong['state'] === 'playable' || $activeSong['state'] === 'paused' ? 'disabled' : '' ?>></button>
                <button class="btn media" id="voldownButton" <?= $activeSong === null || $activeSong['state'] === 'playable' ? 'disabled' : '' ?>></button>
                <button class="btn media" id="volupButton" <?= $activeSong === null || $activeSong['state'] === 'playable' ? 'disabled' : '' ?>></button>
                <button class="btn media" id="forwardButton" <?= $activeSong === null || $activeSong['state'] === 'playable' ? 'disabled' : '' ?>></button>
                <button class="btn media" id="shuffleButton" <?= count($songs) === 0 ? 'disabled' : '' ?>></button>
            </div>
        </header>

        <div class="queue">
            <p><strong>Whats on the list?</strong></p>

            <div class="queue-container">
                <?php foreach ($songs as $song): ?>
                    <div
                        id="song-q-<?= e($song['youtube_id']) ?>"
                        data-state="<?= e($song['state']) ?>"
                        class="songResult<?= $song['queued_by'] !== null ? ' inqueue' : '' ?>"
                    >
                        <div class="imageWrapper">
                            <img src="https://i.ytimg.com/vi/<?= e($song['youtube_id']) ?>/mqdefault.jpg" loading="lazy">
                        </div>

                        <div class="contentWrapper">
                            <p class="title"><?= e($song['title']) ?></p>

                            <span class="status">
                                <?php if ($song['state'] === 'downloading' || $song['state'] === 'download_required'): ?>
                                    Downloading...
                                <?php endif ?>
                                <?php if ($song['state'] === 'download_failed'): ?>
                                    Download Failed
                                <?php endif ?>
                            </span>
                        </div>

                        <?php if ($song['queued_by'] !== null): ?>
                            <p class="username"><?= e($song['queued_by']) ?></p>
                        <?php endif ?>

                        <p class="duration"><?= formatDuration($song['duration']) ?></p>

                        <?php if ($song['state'] === 'playing' || $song['state'] === 'paused'): ?>
                            <progress max="<?= $song['duration'] ?>" value="0"></progress>
                        <?php endif ?>
                    </div>
                <?php endforeach ?>
            </div>
        </div>

        <section id="footer">Lovingly Crafted by Team Freshleaf</section>
    </div>
</body>
</html>
