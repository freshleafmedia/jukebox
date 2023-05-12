<?php

namespace App\Enums;

enum SongState: string {
    case PLAYING = 'playing';
    case PAUSED = 'paused';
    case PLAYABLE = 'playable';
    case DOWNLOADING = 'downloading';
    case DOWNLOAD_REQUIRED = 'download_required';
    case DOWNLOAD_FAILED = 'download_failed';
}
