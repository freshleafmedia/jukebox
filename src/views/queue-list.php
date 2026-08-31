<?php
/**
 * @var Song[] $songs
 */
$statement = Db::connect()->prepare(
    'SELECT * FROM songs
     WHERE queued_by IS NOT NULL
     ORDER BY CASE state WHEN "' . SongState::PLAYING->value . '" THEN 0 WHEN "' . SongState::PAUSED->value . '" THEN 0 ELSE 1 END, sort',
);
$statement->execute();

$songs = array_map(Song::fromDbRow(...), $statement->fetchAll());

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
            <progress id="playbackProgress" max="<?= $song->duration ?>" value="<?= VlcRemote::getPlaybackPosition() ?>"></progress>
        <?php endif ?>
    </div>
<?php endforeach ?>
