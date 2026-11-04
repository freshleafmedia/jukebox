<?php

final class VlcPlayer
{
    private mixed $vlcProcess = null;
    private ?Song $currentSong = null;
    private SongState $currentPlayState = SongState::PAUSED;

    public function run(): void
    {
        echo '[' . date('Y-m-d H:i:s') . '] VLC player started' . PHP_EOL;

        $this->pauseQueueOnBoot();

        while (true) {
            $this->tick();

            usleep(250_000);
        }
    }

    private function pauseQueueOnBoot(): void
    {
        Db::connect()
            ->prepare('UPDATE songs SET state = ?, updated_at = CURRENT_TIMESTAMP WHERE state = ?')
            ->execute([SongState::PAUSED->value, SongState::PLAYING->value]);

        if ($this->queueIsEmpty()) {
            // The first song to get added should autoplay
            $this->currentPlayState = SongState::PLAYING;
        }
    }

    private function tick(): void
    {
        if ($this->currentSong !== null && !$this->isRunning()) {
            $this->finishSong();
        }

        $songToPlay = $this->activeSong() ?? $this->promoteNextPlayableSong();

        if ($songToPlay === null) {
            $this->stop();

            return;
        }

        if ($songToPlay->id !== $this->currentSong?->id) {
            $this->stop();
            $this->start($songToPlay);

            return;
        }

        if ($songToPlay->state !== $this->currentPlayState) {
            if ($songToPlay->state === SongState::PAUSED) {
                VlcRemote::pause();
            } else {
                VlcRemote::play();
            }

            $this->currentPlayState = $songToPlay->state;
        }
    }

    private function activeSong(): ?Song
    {
        $statement = Db::connect()->prepare('SELECT * FROM songs WHERE queued_by IS NOT NULL AND state IN (?, ?) ORDER BY sort LIMIT 1');
        $statement->execute([SongState::PLAYING->value, SongState::PAUSED->value]);
        $row = $statement->fetchAll()[0] ?? false;

        return $row === false ? null : Song::fromDbRow($row);
    }

    private function promoteNextPlayableSong(): ?Song
    {
        $statement = Db::connect()->prepare('SELECT id FROM songs WHERE queued_by IS NOT NULL AND state = ? ORDER BY sort LIMIT 1');
        $statement->execute([SongState::PLAYABLE->value]);
        $songId = $statement->fetchAll(PDO::FETCH_COLUMN)[0] ?? false;

        if ($songId === false) {
            return null;
        }

        Db::connect()
            ->prepare('UPDATE songs SET state = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            ->execute([$this->currentPlayState->value, $songId]);

        return $this->activeSong();
    }

    private function start(Song $song): void
    {
        echo '[' . date('Y-m-d H:i:s') . '] Playing "' . $song->title . '" (' . $song->youtubeId . ')' . PHP_EOL;

        $this->vlcProcess = proc_open(
            [
                'cvlc',
                '--play-and-exit',
                ...($song->state === SongState::PAUSED ? ['--start-paused'] : []),
                '-I',
                'rc',
                '--rc-host',
                VLC_RC_HOST,
                SONGS_PATH . '/' . $song->youtubeId . '.mp3',
            ],
            [1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']],
            $pipes,
        );
        $this->currentSong = $song;
        $this->currentPlayState = $song->state;

        Db::connect()
            ->prepare('INSERT INTO song_history (song_id, played_by, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)')
            ->execute([$song->id, $song->queuedBy]);
    }

    private function finishSong(): void
    {
        echo '[' . date('Y-m-d H:i:s') . '] Finished song #' . $this->currentSong->id . PHP_EOL;

        proc_close($this->vlcProcess);

        Db::connect()
            ->prepare('UPDATE songs SET state = ?, queued_by = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            ->execute([SongState::PLAYABLE->value, $this->currentSong->id]);

        $this->vlcProcess = null;
        $this->currentSong = null;
    }

    private function stop(): void
    {
        if ($this->vlcProcess === null) {
            return;
        }

        if ($this->isRunning()) {
            proc_terminate($this->vlcProcess);
        }

        proc_close($this->vlcProcess);

        $this->vlcProcess = null;
        $this->currentSong = null;
        $this->currentPlayState = SongState::PLAYING;
    }

    private function queueIsEmpty(): bool
    {
        return (bool) Db::connect()
            ->query('SELECT NOT EXISTS (SELECT 1 FROM songs WHERE queued_by IS NOT NULL)')
            ->fetchColumn();
    }

    private function isRunning(): bool
    {
        return $this->vlcProcess !== null && proc_get_status($this->vlcProcess)['running'];
    }
}
