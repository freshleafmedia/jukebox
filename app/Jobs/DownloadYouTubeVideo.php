<?php

namespace App\Jobs;

use App\Enums\SongState;
use App\Models\Song;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Process\Exceptions\ProcessFailedException;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Throwable;

class DownloadYouTubeVideo implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Song $song,
    )
    {
    }

    public function handle(): void
    {
        $this->song
            ->update([
                'state' => SongState::DOWNLOADING,
            ]);

        if (Storage::disk('songs')->exists($this->song->youtube_id) === false) {
            Process::forever()
                ->run('/tmp/yt-dlp_linux --no-overwrites --extract-audio --audio-format mp3 --format bestaudio* --paths ' . Storage::disk('songs')->path('') . ' --output ' . $this->song->youtube_id . ' -- ' . $this->song->youtube_id)
                ->throw();

            Storage::disk('songs')->move($this->song->youtube_id . '.mp3', $this->song->youtube_id);
        }

        $this->song
            ->update([
                'state' => SongState::PLAYABLE,
            ]);
    }

    public function failed(Throwable $exception): void
    {
        $this->song
            ->update([
                'state' => SongState::DOWNLOAD_FAILED,
            ]);
    }
}
