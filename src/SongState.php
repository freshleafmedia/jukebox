<?php

enum SongState: string
{
    case Playing = 'playing';
    case Paused = 'paused';
    case Playable = 'playable';
    case Downloading = 'downloading';
    case DownloadRequired = 'download_required';
    case DownloadFailed = 'download_failed';
}
