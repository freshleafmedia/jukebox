<?php

$songs = array_map(
    Song::fromDbRow(...),
    db()->query('SELECT * FROM songs WHERE queued_by IS NOT NULL ORDER BY sort')->fetchAll(),
);

foreach ($songs as $i => $song) {
    if ($song->state === SongState::PLAYING || $song->state === SongState::PAUSED) {
        array_unshift($songs, ...array_splice($songs, $i, 1));
        break;
    }
}

$activeSong = null;
$nextPlayableSong = null;

foreach ($songs as $song) {
    if ($song->state === SongState::PLAYING || $song->state === SongState::PAUSED) {
        $activeSong = $song;
    }
    if ($song->state === SongState::PLAYABLE && $nextPlayableSong === null) {
        $nextPlayableSong = $song;
    }
}

$activeSong ??= $nextPlayableSong;

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

    <script src="https://cdn.jsdelivr.net/npm/htmx.org@4.0.0" integrity="sha384-BvJpBiO8Kh31EqtJe5DRIeWrHWnCGkwytKs9NKFi86Hhw96dEqdEMzZDeK9iEGTc" crossorigin="anonymous"></script>
</head>
<body class="playing">
    <div id="background"></div>
    <div id="wrapper">
        <header>
            <div class="masthead">
                <h1>Freshleaf Jukebox</h1>
                <button class="btn" id="addButton" onclick="document.getElementById('addDialog').showModal()">Add Song</button>
            </div>

            <div class="media-controls">
                <button class="btn media" id="playButton" hx-post="/action/play" hx-swap="none" <?= $activeSong === null || $activeSong->state === SongState::PLAYING ? 'disabled' : '' ?>></button>
                <button class="btn media" id="pauseButton" hx-post="/action/pause" hx-swap="none" <?= $activeSong === null || $activeSong->state === SongState::PLAYABLE || $activeSong->state === SongState::PAUSED ? 'disabled' : '' ?>></button>
                <button class="btn media" id="voldownButton" hx-post="/action/volume-down" hx-swap="none" <?= $activeSong === null || $activeSong->state === SongState::PLAYABLE ? 'disabled' : '' ?>></button>
                <button class="btn media" id="volupButton" hx-post="/action/volume-up" hx-swap="none" <?= $activeSong === null || $activeSong->state === SongState::PLAYABLE ? 'disabled' : '' ?>></button>
                <button class="btn media" id="forwardButton" hx-post="/action/skip" hx-swap="none" <?= $activeSong === null || $activeSong->state === SongState::PLAYABLE ? 'disabled' : '' ?>></button>
                <button class="btn media" id="shuffleButton" hx-post="/action/shuffle" hx-swap="none" <?= count($songs) === 0 ? 'disabled' : '' ?>></button>
            </div>
        </header>

        <div class="queue">
            <p><strong>Whats on the list?</strong></p>

            <div class="queue-container">
                <?php foreach ($songs as $song): ?>
                    <div
                        id="song-q-<?= e($song->youtubeId) ?>"
                        data-state="<?= e($song->state->value) ?>"
                        class="songResult<?= $song->queuedBy !== null ? ' inqueue' : '' ?>"
                    >
                        <div class="imageWrapper">
                            <img src="https://i.ytimg.com/vi/<?= e($song->youtubeId) ?>/mqdefault.jpg" loading="lazy">
                        </div>

                        <div class="contentWrapper">
                            <p class="title"><?= e($song->title) ?></p>

                            <span class="status">
                                <?php if ($song->state === SongState::DOWNLOADING || $song->state === SongState::DOWNLOAD_REQUIRED): ?>
                                    Downloading...
                                <?php endif ?>
                                <?php if ($song->state === SongState::DOWNLOAD_FAILED): ?>
                                    Download Failed
                                <?php endif ?>
                            </span>
                        </div>

                        <?php if ($song->queuedBy !== null): ?>
                            <p class="username"><?= e($song->queuedBy) ?></p>
                        <?php endif ?>

                        <p class="duration"><?= formatDuration($song->duration) ?></p>

                        <?php if ($song->state === SongState::PLAYING || $song->state === SongState::PAUSED): ?>
                            <progress max="<?= $song->duration ?>" value="0"></progress>
                        <?php endif ?>
                    </div>
                <?php endforeach ?>
            </div>
        </div>

        <section id="footer">Lovingly Crafted by Team Freshleaf</section>
    </div>

    <dialog id="addDialog">
        <div class="overlay-wrapper">
            <form method="dialog">
                <button id="addDialogClose">X</button>
            </form>

            <div class="search-header">
                <strong>Search YouTube</strong>
                <input
                    type="text"
                    id="search"
                    name="q"
                    autofocus
                    hx-get="/action/search"
                    hx-target="#search-results"
                    hx-trigger="input changed delay:400ms, search"
                    hx-indicator="#search-status"
                >
            </div>

            <div id="search-container">
                <p id="search-status" class="htmx-indicator status">Searching...</p>
                <div id="search-results"></div>
            </div>
        </div>
    </dialog>

    <script>
        const addDialog = document.getElementById('addDialog');

        addDialog.addEventListener('click', (event) => {
            if (event.target.id === 'addDialog') {
                event.target.close();
            }
        });

        addDialog.addEventListener('close', () => {
            document.getElementById('search').value = '';
            document.getElementById('search-results').innerHTML = '';
        });
    </script>
</body>
</html>
