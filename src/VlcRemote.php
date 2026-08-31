<?php

final readonly class VlcRemote
{
    public static function send(VlcCommand $command): void
    {
        $connection = @stream_socket_client('unix://' . VLC_RC_SOCKET_PATH, timeout: 1);

        if ($connection === false) {
            return;
        }

        fwrite($connection, $command->value . "\n");
        fclose($connection);
    }

    public static function query(VlcCommand $command): ?int
    {
        $connection = @stream_socket_client('unix://' . VLC_RC_SOCKET_PATH, timeout: 1);

        if ($connection === false) {
            return null;
        }

        stream_set_timeout($connection, 1);

        fwrite($connection, $command->value . "\n");

        $reply = trim(fread($connection, 1024));

        fclose($connection);

        return ctype_digit($reply) ? (int) $reply : null;
    }
}
