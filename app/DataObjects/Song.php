<?php

namespace App\DataObjects;

use App\Enums\SongState;
use App\Models\Song as SongModel;
use Carbon\CarbonInterval;
use Illuminate\Support\Facades\Process;
use stdClass;

class Song
{
    public function __construct(
        public readonly string         $youTubeId,
        public readonly string         $title,
        public readonly CarbonInterval $duration,
        public readonly SongState|null $state,
        public readonly string|null    $queuedBy,
    )
    {
    }

    public static function fromYouTubeSearchResult(stdClass $data): self
    {
        $queuedSong = SongModel::where('youtube_id', '=', $data->id)->first();

        return new self(
            youTubeId: $data->id,
            title: $data->snippet->title,
            duration: CarbonInterval::fromString($data->contentDetails->duration),
            state: $queuedSong === null ? SongState::DOWNLOAD_REQUIRED : $queuedSong->state,
            queuedBy: $queuedSong?->queued_by,
        );
    }

    public static function fromModel(SongModel $model): self
    {
        return new self(
            youTubeId: $model->youtube_id,
            title: $model->title,
            duration: CarbonInterval::seconds($model->duration)->cascade(),
            state: $model->state,
            queuedBy: $model->queued_by,
        );
    }

    public function getDurationForHumans(): string
    {
        if ($this->duration->hours > 0) {
            return $this->duration->format('%h:%I:%S');
        }

        return $this->duration->format('%i:%S');
    }

    public function getElapsedTime(): ?int
    {
        $cmd = Process::run('echo "get_time" | netcat -N localhost 11337');

        $outputLines = explode(PHP_EOL, $cmd->output());

        if (count($outputLines) !== 5) {
            return null;
        }

        return (int) trim(str_replace('> ', '', $outputLines[2]));
    }
}
