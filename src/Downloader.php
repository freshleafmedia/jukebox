<?php

final class Downloader
{
    public function run(): void
    {
        echo '[' . date('Y-m-d H:i:s') . '] Download worker started' . PHP_EOL;

        while (true) {
            $song = $this->nextSong();

            if ($song === null) {
                sleep(2);

                continue;
            }

            $this->download($song);
        }
    }

    private function nextSong(): ?Song
    {
        $statement = db()->prepare('SELECT * FROM songs WHERE state = ? ORDER BY sort ASC LIMIT 1');
        $statement->execute([SongState::DownloadRequired->value]);

        $row = $statement->fetch();

        return $row === false ? null : Song::fromDbRow($row);
    }

    private function download(Song $song): void
    {
        echo '[' . date('Y-m-d H:i:s') . '] Downloading "' . $song->title . '" (' . $song->youtubeId . ')... ';

        $this->setSongState($song->id, SongState::Downloading);

        $destination = SONGS_PATH . '/' . $song->youtubeId . '.mp3';
        $tmpFile = TMP_PATH . '/' . $song->youtubeId . '.mp3';

        if (!is_file($destination)) {
            $command = 'yt-dlp'
                . ' --no-overwrites'
                . ' --extract-audio'
                . ' --audio-format mp3'
                . ' --format bestaudio*'
                . ' --js-runtimes ' . escapeshellarg(JS_RUNTIME_PATH)
                . ' --paths ' . escapeshellarg(TMP_PATH)
                . ' --output ' . escapeshellarg($song->youtubeId . '.%(ext)s')
                . ' -- ' . escapeshellarg($song->youtubeId);

            exec($command, result_code: $exitCode);

            if ($exitCode !== 0 || !is_file($tmpFile)) {
                $this->setSongState($song->id, SongState::DownloadFailed);

                echo 'Failed' . PHP_EOL;

                return;
            }

            rename($tmpFile, $destination);
        }

        $this->setSongState($song->id, SongState::Playable);

        echo 'Done' . PHP_EOL;
    }

    private function setSongState(int $songId, SongState $state): void
    {
        db()
            ->prepare('UPDATE songs SET state = ? WHERE id = ?')
            ->execute([$state->value, $songId]);
    }
}
