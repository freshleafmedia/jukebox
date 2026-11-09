<?php

http_response_code(200);

$titles = Db::connect()
    ->query('SELECT title FROM songs WHERE title LIKE \'% - %\'')
    ->fetchAll(PDO::FETCH_COLUMN);

// Titles are expected as 'artist - song title'. Dedupe case-insensitively.
$artists = [];

foreach ($titles as $title) {
    $artist = trim(explode(' - ', $title, 2)[0]);

    if ($artist === '' || mb_strlen($artist) > 40) {
        continue;
    }

    $key = mb_strtolower($artist);

    $artists[$key] ??= ['name' => $artist, 'count' => 0];
    $artists[$key]['count']++;
}

// Only include artists 3 or more songs
$artists = array_column(
    array_filter($artists, fn (array $artist): bool => $artist['count'] > 3),
    'name',
);

shuffle($artists);

foreach ($artists as $artist):
    // Card colour is a function of the first letter: A-Z map across the colour wheel.
    $first = mb_strtolower(mb_substr($artist, 0, 1));
    if ($first >= 'a' && $first <= 'z') {
        $hue = (int)round((ord($first) - ord('a')) * 360 / 26);
    } else {
        $hue = mb_ord($first) % 360;
    }
    ?>
    <button
        type="button"
        class="artistTag"
        style="--hue: <?= $hue ?>"
        data-artist="<?= e($artist) ?>"
    ><span><?= e($artist) ?></span></button>
<?php endforeach ?>
