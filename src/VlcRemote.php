<?php

final readonly class VlcRemote
{
    public static function play(): void
    {
        self::send('play');
    }

    public static function pause(): void
    {
        self::send('pause');
    }

    public static function volumeUp(int $amount = 1): void
    {
        self::send('volup ' . $amount);
    }

    public static function volumeDown(int $amount = 1): void
    {
        self::send('voldown ' . $amount);
    }

    public static function getPlaybackPosition(): ?int
    {
        $playbackPosition = self::send('get_time');

        if ($playbackPosition === null || ctype_digit($playbackPosition) === false) {
            return null;
        }

        return (int) $playbackPosition;
    }

    private static function send(string $command): ?string
    {
        $connection = stream_socket_client('tcp://' . VLC_RC_HOST, timeout: 1);

        if ($connection === false) {
            return null;
        }

        stream_set_timeout($connection, 1);

        fwrite($connection, $command . "\n");

        $content = '';

        while (substr_count($content, '> ') < 2) {
            $chunk = fread($connection, 2024);

            if ($chunk === false || $chunk === '') {
                break;
            }

            $content .= $chunk;
        }

        fclose($connection);

        $parts = explode('> ', $content);
        $response = trim($parts[count($parts) - 2] ?? '');

        if ($response === '') {
            return null;
        }

        return $response;
    }
}
