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

/**
 * @param array<array{id: int, queued_by: string}> $rows Queued songs ordered by their current sort.
 * @return int[] Song ids in fair, round-robin order across users.
 */
function fairQueueOrder(array $rows): array
{
    $songIdsGroupedByUser = [];

    foreach ($rows as $row) {
        $songIdsGroupedByUser[$row['queued_by']][] = $row['id'];
    }

    $userNames = array_keys($songIdsGroupedByUser);
    shuffle($userNames);
    $nextIndexByUser = array_fill_keys($userNames, 0);
    $ordered = [];

    while ($userNames !== []) {
        foreach ($userNames as $i => $user) {
            $ordered[] = $songIdsGroupedByUser[$user][$nextIndexByUser[$user]++];

            if ($nextIndexByUser[$user] >= count($songIdsGroupedByUser[$user])) {
                unset($userNames[$i]);
            }
        }
    }

    return $ordered;
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
