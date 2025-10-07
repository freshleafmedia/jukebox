<?php

namespace App\Http\Livewire;

use App\DataObjects\Song;
use App\Enums\SongState;
use App\Models\Song as SongModel;
use App\Services\QueueService;
use Illuminate\Support\Collection;
use Livewire\Component;

class Jukebox extends Component
{
    public bool $addSongIsVisible = false;
    public string $addSongTabActive = 'search';

    public function render(QueueService $songService)
    {
        $activeSong = null;
        $nextPlayableSong = null;
        $queuedSongs = Collection::empty();

        $songService->getQueuedSongs()->each(function (SongModel $songModel) use (&$nextPlayableSong, &$activeSong, $queuedSongs): void {
            $song = Song::fromModel($songModel);

            if ($song->state === SongState::PLAYING || $song->state === SongState::PAUSED) {
                $activeSong = $song;
            }

            if ($song->state === SongState::PLAYABLE && $nextPlayableSong === null) {
                $nextPlayableSong = $song;
            }

            $queuedSongs->push($song);
        });

        if ($activeSong === null && $nextPlayableSong !== null) {
            $activeSong = $nextPlayableSong;
        }

        return view('livewire.jukebox')
            ->with([
                'queuedSongs' => $queuedSongs,
                'activeSong' => $activeSong,
            ]);
    }

    public function play(): void
    {
        app(QueueService::class)->play();
    }

    public function pause(): void
    {
        app(QueueService::class)->pause();
    }

    public function volumeUp(): void
    {
        app(QueueService::class)->volumeUp();
    }

    public function volumeDown(): void
    {
        app(QueueService::class)->volumeDown();
    }

    public function skip(): void
    {
        app(QueueService::class)->skip();
    }

    public function shuffle(): void
    {
        app(QueueService::class)->shuffle();
    }
}
