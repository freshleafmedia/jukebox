<?php

namespace App\Http\Livewire;

use App\DataObjects\Song;
use App\Models\Song as SongModel;
use App\Services\QueueService;
use Illuminate\Support\ItemNotFoundException;
use Livewire\Component;

class Jukebox extends Component
{
    public bool $addSongIsVisible = false;
    public string $addSongTabActive = 'search';

    public function render(QueueService $songService)
    {
        try {
            $activeSong = Song::fromModel($songService->getPlayableSongAtTopOfQueue());
        } catch (ItemNotFoundException) {
            $activeSong = null;
        }

        return view('livewire.jukebox')
            ->with([
                'queuedSongs' => $songService->getQueuedSongs()->map(fn (SongModel $songModel): Song => Song::fromModel($songModel)),
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
