<?php

namespace App\Http\Livewire;

use App\DataObjects\Song;
use App\Models\Song as SongModel;
use App\Services\QueueService;
use Livewire\Component;

class MostPlayed extends Component
{
    public function render()
    {
        $songs = SongModel::withCount('Plays')
            ->orderBy('plays_count', 'DESC')
            ->take(20)
            ->get();

        return view('livewire.most-played')
            ->with([
                'songs' => $songs->map(fn (SongModel $songModel): Song => Song::fromModel($songModel))
            ]);
    }

    public function queueSong(string $youTubeId): void
    {
        app(QueueService::class)->queueSong($youTubeId);

        $song = SongModel::where('youtube_id', '=', $youTubeId)->first();
        $this->emit('songAdded', Song::fromModel($song));
    }
}
