<?php

namespace App\Console\Commands;

use App\Enums\SongState;
use App\Models\Song;
use App\Models\SongPlay;
use App\Services\QueueService;
use Illuminate\Console\Command;
use Illuminate\Contracts\Process\InvokedProcess;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ItemNotFoundException;

class RunVlcPlayer extends Command
{
    protected $signature = 'run-vlc-player';
    protected $description = 'Run VLC Player';

    protected InvokedProcess|null $currentPlayingSongVlcProcess = null;

    public function handle(QueueService $songService)
    {
        while (true) {
            usleep(250_000);

            try {
                $songOnTopOfQueue = $songService->getPlayableSongAtTopOfQueue();
            } catch (ItemNotFoundException) {
                $this->killVlc();

                continue;
            }

            $songStarted = $this->currentPlayingSongVlcProcess?->running() === true;
            $songNotStarted = $this->currentPlayingSongVlcProcess === null || $this->currentPlayingSongVlcProcess->running() === false;
            $songFinished = $this->currentPlayingSongVlcProcess !== null && $this->currentPlayingSongVlcProcess->running() === false;
            $vlcIsPlaying = $this->vlcIsPlaying();
            $vlcIsPaused = $this->vlcIsPaused();

            if ($songStarted) {
                if ($vlcIsPlaying && $songOnTopOfQueue->state === SongState::PLAYING) {
                    continue;
                }

                if ($vlcIsPaused && $songOnTopOfQueue->state === SongState::PAUSED) {
                    continue;
                }

                if ($vlcIsPlaying && $songOnTopOfQueue->state === SongState::PAUSED) {
                    Process::run('echo "pause" | netcat -N localhost 11337');

                    continue;
                }

                if ($vlcIsPaused && $songOnTopOfQueue->state === SongState::PLAYING) {
                    Process::run('echo "play" | netcat -N localhost 11337');

                    continue;
                }
            }


            if ($songFinished) {
                $songOnTopOfQueue->update([
                        'state' => SongState::PLAYABLE,
                        'queued_by' => null,
                    ]);

                $songService->play();

                $this->killVlc();

                continue;
            }

            if ($songNotStarted) {
                $play = new SongPlay();
                $play->Song()->associate($songOnTopOfQueue);
                $play->played_by = $songOnTopOfQueue->queued_by;
                $play->save();

                $this->currentPlayingSongVlcProcess = Process::forever()
                    ->start('cvlc --play-and-exit -I rc --rc-host localhost:11337 ' . Storage::disk('songs')->path($songOnTopOfQueue->youtube_id));

                continue;
            }
        }
    }

    protected function vlcIsPlaying(): bool
    {
        return Process::run('echo "status" | netcat -N localhost 11337')
            ->seeInOutput('( state playing )');
    }

    protected function vlcIsPaused(): bool
    {
        return Process::run('echo "status" | netcat -N localhost 11337')
            ->seeInOutput('( state paused )');
    }

    protected function killVlc(): void
    {
        if ($this->currentPlayingSongVlcProcess?->running()) {
            $this->currentPlayingSongVlcProcess->signal(SIGTERM);
        }

        $this->currentPlayingSongVlcProcess = null;
    }
}
