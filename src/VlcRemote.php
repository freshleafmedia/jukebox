<?php

final readonly class VlcRemote
{
    public static function send(VlcCommand $command): void
    {
        $connection = @stream_socket_client('tcp://' . VLC_RC_HOST, timeout: 1);

        if ($connection === false) {
            return;
        }

        fwrite($connection, $command->value . "\n");
        fclose($connection);
    }
}
