<?php
/**
 * @var Song[] $songs
 */
$songs = array_map(
    Song::fromDbRow(...),
    Db::connect()->query('SELECT * FROM songs WHERE queued_by IS NOT NULL ORDER BY sort')->fetchAll(),
);

?>
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
