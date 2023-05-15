<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\SongState;
use App\Models\Song;
use App\Models\Song as SongModel;
use Carbon\CarbonInterval;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\ItemNotFoundException;
use Madcoda\Youtube\Youtube;
use stdClass;

class QueueService
{
    public function getQueuedSongs(): Collection
    {
        $songs = Song::query()
            ->whereNotNull('queued_by')
            ->orderBy('sort')
            ->get();

        $queuedSongs = $songs
            ->filter(fn (SongModel $song): bool => $song->state !== SongState::PLAYING && $song->state !== SongState::PAUSED);

        $activeSong = $songs
            ->first(fn (SongModel $song): bool => $song->state === SongState::PLAYING || $song->state === SongState::PAUSED);

        if ($activeSong !== null) {
            $queuedSongs = $queuedSongs
                ->prepend($activeSong);
        }

        return $queuedSongs;
    }

    public function getNextPlayableSong(): Song
    {
        return $this
            ->getQueuedSongs()
            ->firstOrFail(fn (Song $song): bool => $song->state === SongState::PLAYABLE);
    }

    public function getActiveSong(): Song
    {
        return $this
            ->getQueuedSongs()
            ->firstOrFail(fn (Song $song): bool => $song->state === SongState::PLAYING || $song->state === SongState::PAUSED);
    }

    public function getPlayableSongAtTopOfQueue(): Song
    {
        try {
            return $this->getActiveSong();
        } catch (ItemNotFoundException) {
            return $this->getNextPlayableSong();
        }
    }

    public function play(): void
    {
        try {
            $song = $this->getActiveSong();
        } catch (ItemNotFoundException) {
            try {
                $song = $this->getNextPlayableSong();
            } catch (ItemNotFoundException) {
                return;
            }
        }

        $song->update([
            'state' => SongState::PLAYING,
        ]);
    }

    public function pause(): void
    {
        try {
            $song = $this->getActiveSong();
        } catch (ItemNotFoundException) {
            return;
        }

        $song->update([
            'state' => SongState::PAUSED,
        ]);
    }

    public function volumeUp(): void
    {
        Process::run('echo "volup 1" | netcat -N localhost 11337');
    }

    public function volumeDown(): void
    {
        Process::run('echo "voldown 1" | netcat -N localhost 11337');
    }

    public function skip(): void
    {
        Process::run('echo "shutdown" | netcat -N localhost 11337');
    }

    public function shuffle(): void
    {
        $this->setQueueOrder(shuffle: true);
    }

    public function queueSong(string $youTubeId): void
    {
        $youTubeApi = new Youtube(['key' => env('YOUTUBE_API_KEY')]);
        $youTubeApi->setReferer('https://jukebox');

        $songInfo = Cache::remember(
            $youTubeId,
            null,
            fn (): stdClass => $youTubeApi->getVideoInfo($youTubeId)
        );

        $queuer = 'Someone';

        if (Song::where('youtube_id', '=', $songInfo->id)->doesntExist()) {
            Song::create([
                'youtube_id' => $songInfo->id,
                'title' => $songInfo->snippet->title,
                'duration' => CarbonInterval::fromString($songInfo->contentDetails->duration)->totalSeconds,
                'state' => SongState::DOWNLOAD_REQUIRED,
                'queued_by' => $queuer,
                'sort' => $this->getNextSortKey(),
            ]);
        } else {
            Song::where('youtube_id', '=', $songInfo->id)
                ->sole()
                ->update([
                    'queued_by' => $queuer,
                    'sort' => $this->getNextSortKey(),
                ]);
        }

        $this->setQueueOrder();
    }

    protected function getNextSortKey(): int
    {
        return (Song::query()->max('sort') ?? 0) + 1;
    }

    protected function setQueueOrder(bool $shuffle = false): void
    {
        $queue = new Collection();

        $all = $this
            ->getQueuedSongs()
            ->when($shuffle, fn (Collection $songs): Collection => $songs->shuffle())
            ->sort(fn (Song $a, Song $b): int => $a->getSortValue() <=> $b->getSortValue());

        $songsGroupedByUser = $all
            ->groupBy('queued_by')
            ->sortKeys();

        try {
            $activeSong = $this->getActiveSong();
        } catch (ItemNotFoundException) {
            $activeSong = null;
        }

        while ($songsGroupedByUser->flatten()->isNotEmpty()) {
            $songsGroupedByUser
                ->each(function (Collection $group, ?string $queued_by) use ($activeSong, $all, $queue): void {
                    if ($queue->isEmpty() && $queued_by !== $activeSong?->queued_by) {
                        return;
                    }

                    if ($group->isEmpty()) {
                        return;
                    }

                    $queue->push($group->shift());
                });
        }

        $i = 0;
        $queue
            ->each(function (Song $song) use (&$i): void {
                $song->update([
                    'sort' => $i++,
                ]);
            });
    }
}
