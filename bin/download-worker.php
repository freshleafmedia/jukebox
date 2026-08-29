<?php

require __DIR__ . '/../config.php';
require __DIR__ . '/../database.php';
require __DIR__ . '/../src/SongState.php';
require __DIR__ . '/../src/Song.php';
require __DIR__ . '/../src/Downloader.php';

new Downloader()->run();
