<?php

final readonly class VideoInfo
{
    public function __construct(
        public string $youtubeId,
        public string $title,
        public int $duration,
    ) {
    }
}
