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
        $statement = Db::connect()->prepare('SELECT * FROM songs WHERE state = ? ORDER BY sort ASC LIMIT 1');
        $statement->execute([SongState::DOWNLOAD_REQUIRED->value]);
        $row = $statement->fetchAll()[0] ?? false;

        return $row === false ? null : Song::fromDbRow($row);
    }

    private function download(Song $song): void
    {
        echo '[' . date('Y-m-d H:i:s') . '] Downloading "' . $song->title . '" (' . $song->youtubeId . ')... ';

        $this->setSongState($song->id, SongState::DOWNLOADING);

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
                $this->setSongState($song->id, SongState::DOWNLOAD_FAILED);

                echo 'Failed' . PHP_EOL;

                return;
            }

            rename($tmpFile, $destination);
        }

        $this->setSongState($song->id, SongState::PLAYABLE);

        echo 'Done' . PHP_EOL;
    }

    private function setSongState(int $songId, SongState $state): void
    {
        Db::connect()
            ->prepare('UPDATE songs SET state = ? WHERE id = ?')
            ->execute([$state->value, $songId]);
    }
}
