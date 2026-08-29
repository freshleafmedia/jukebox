<?php
/**
 * @var Song|null $activeSong
 */
$statement = Db::connect()->prepare('SELECT * FROM songs WHERE queued_by IS NOT NULL AND state IN (?, ?) ORDER BY sort LIMIT 1');
$statement->execute([SongState::PLAYING->value, SongState::PAUSED->value]);
$rows = $statement->fetchAll();
$row = $rows[0] ?? false;

if ($row === false) {
    $statement = Db::connect()->prepare('SELECT * FROM songs WHERE queued_by IS NOT NULL AND state = ? ORDER BY sort LIMIT 1');
    $statement->execute([SongState::PLAYABLE->value]);
    $rows = $statement->fetchAll();
    $row = $rows[0] ?? false;
}

$activeSong = $row === false ? null : Song::fromDbRow($row);
?>
<button class="btn media" id="playButton" hx-post="/action/play" hx-swap="none" <?= $activeSong === null || $activeSong->state === SongState::PLAYING ? 'disabled' : '' ?>></button>
<button class="btn media" id="pauseButton" hx-post="/action/pause" hx-swap="none" <?= $activeSong === null || $activeSong->state === SongState::PLAYABLE || $activeSong->state === SongState::PAUSED ? 'disabled' : '' ?>></button>
<button class="btn media" id="voldownButton" hx-post="/action/volume-down" hx-swap="none" <?= $activeSong === null || $activeSong->state === SongState::PLAYABLE ? 'disabled' : '' ?>></button>
<button class="btn media" id="volupButton" hx-post="/action/volume-up" hx-swap="none" <?= $activeSong === null || $activeSong->state === SongState::PLAYABLE ? 'disabled' : '' ?>></button>
<button class="btn media" id="forwardButton" hx-post="/action/skip" hx-swap="none" <?= $activeSong === null || $activeSong->state === SongState::PLAYABLE ? 'disabled' : '' ?>></button>
<button class="btn media" id="shuffleButton" hx-post="/action/shuffle" hx-swap="none" <?= $activeSong === null ? 'disabled' : '' ?>></button>
