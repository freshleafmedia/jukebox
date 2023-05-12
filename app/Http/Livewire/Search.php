<?php

namespace App\Http\Livewire;

use App\DataObjects\Song;
use App\Models\Song as SongModel;
use App\Services\QueueService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Livewire\Component;
use Madcoda\Youtube\Youtube;
use stdClass;

class Search extends Component
{
    public string|null $searchTerm = null;

    public function render()
    {
        $youTubeApi = new Youtube(['key' => env('YOUTUBE_API_KEY')]);
        $youTubeApi->setReferer('https://jukebox');

        $results = new Collection();

        if ($this->searchTerm !== null) {
            $resultIds = Cache::remember(
                'search:' . trim(strtolower($this->searchTerm)),
                null,
                function () use ($youTubeApi) {
                    $searchParams = array(
                        'q' => $this->searchTerm,
                        'type' => 'video',
                        'part' => 'id, snippet',
                        'maxResults' => 30,
                        'topidId' => '/m/04rlf', // Music
                        'videoDimension' => '2d',
                    );

                    return Collection::make($youTubeApi->searchAdvanced($searchParams))->pluck('id.videoId');
                }
            );

            $missingIds = $resultIds
                ->filter(fn (string $id): bool => Cache::missing($id));

            if ($missingIds->isNotEmpty()) {
                Collection::make($youTubeApi->getVideosInfo($missingIds->toArray()))
                    ->each(function (stdClass $videoInfo): void {
                        Cache::put($videoInfo->id, $videoInfo);
                    });
            }

            $results = $resultIds
                ->map(fn (string $id): stdClass => Cache::get($id))
                ->map(fn (stdClass $searchResult): Song => Song::fromYouTubeSearchResult($searchResult));
        }

        return view('livewire.search')
            ->with([
                'results' => $results,
            ]);
    }

    public function queueSong(string $youTubeId): void
    {
        app(QueueService::class)->queueSong($youTubeId);

        $song = SongModel::where('youtube_id', '=', $youTubeId)->first();
        $this->emit('songAdded', Song::fromModel($song));
    }
}
