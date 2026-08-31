<?php

function e(mixed $value): string
{
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}

function renderView(string $path, array $vars = []): string
{
    extract($vars);

    ob_start();
    require $path;

    return ob_get_clean();
}

function formatDuration(int $seconds): string
{
    $h = intdiv($seconds, 3600);
    $m = intdiv($seconds % 3600, 60);
    $s = $seconds % 60;

    $s = str_pad((string) $s, 2, '0', STR_PAD_LEFT);

    if ($h > 0) {
        $m = str_pad((string) $m, 2, '0', STR_PAD_LEFT);
        return $h . ':' . $m . ':' . $s;
    } else {
        return $m . ':' . $s;
    }
}
