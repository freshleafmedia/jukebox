<?php

require __DIR__ . '/../config.php';
require __DIR__ . '/../src/Db.php';
require __DIR__ . '/../src/SongState.php';
require __DIR__ . '/../src/Song.php';
require __DIR__ . '/../src/VlcCommand.php';
require __DIR__ . '/../src/VlcRemote.php';
require __DIR__ . '/../src/VlcPlayer.php';

new VlcPlayer()->run();
