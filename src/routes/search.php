<?php

$term = trim($_GET['q'] ?? '');

http_response_code(200);

if ($term === '') {
    return;
}

$youtube = new YoutubeApi();

try {
    $results = $youtube->search($term);
} catch (RuntimeException $e) {
    echo '<p class="status">Search is unavailable right now, try again shortly.</p>' . $e->getMessage();

    return;
}

$existing = [];

if ($results !== []) {
    $ids = array_map(fn (SearchResult $result): string => $result->youtubeId, $results);
    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    $statement = Db::connect()->prepare('SELECT youtube_id, state, queued_by FROM songs WHERE youtube_id IN (' . $placeholders . ')');
    $statement->execute($ids);

    foreach ($statement->fetchAll() as $row) {
        $existing[$row['youtube_id']] = $row;
    }
}

foreach ($results as $result):
    $info = $youtube->videoInfo($result->youtubeId);

    if ($info === null) {
        continue;
    }

    $state = $existing[$info->youtubeId]['state'] ?? 'download_required';
    $inQueue = ($existing[$info->youtubeId]['queued_by'] ?? null) !== null;
    ?>
    <div
        class="songResult<?= $inQueue ? ' inqueue' : '' ?>"
        data-state="<?= e($state) ?>"
        <?php if (!$inQueue): ?>
        hx-post="/action/queue-song"
        hx-vals='js:{"youtube_id":"<?= e($info->youtubeId) ?>","queued_by":localStorage.getItem("name")}'
        hx-swap="none"
        hx-on::before:request="this.classList.add('inqueue')"
        <?php endif ?>
    >
        <div class="imageWrapper">
            <img src="https://i.ytimg.com/vi/<?= e($info->youtubeId) ?>/mqdefault.jpg" loading="lazy">
        </div>

        <div class="contentWrapper">
            <p class="title"><?= e($info->title) ?></p>
        </div>

        <p class="duration"><?= formatDuration($info->duration) ?></p>
    </div>
<?php endforeach ?>
