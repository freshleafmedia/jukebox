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

    public static function volumeUp(int $amount): void
    {
        self::send('volup ' . $amount);
    }

    public static function volumeDown(int $amount): void
    {
        self::send('voldown ' . $amount);
    }

    public static function getPlaybackPosition(): ?int
    {
        $reply = self::send('get_time');

        return ctype_digit($reply) ? (int) $reply : null;
    }

    public static function send(string $command): ?int
    {
        $connection = @stream_socket_client('unix://' . VLC_RC_SOCKET_PATH, timeout: 1);

        if ($connection === false) {
            return null;
        }

        stream_set_timeout($connection, 1);

        fwrite($connection, $command . "\n");

        $reply = trim(fread($connection, 1024));

        fclose($connection);

        return $reply;
    }
}
