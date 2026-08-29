<?php

final readonly class Song
{
    public function __construct(
        public int $id,
        public string $youtubeId,
        public string $title,
        public int $duration,
        public ?string $queuedBy,
        public SongState $state,
        public int $sort,
    ) {
    }

    public static function fromDbRow(array $row): self
    {
        return new self(
            id: (int) $row['id'],
            youtubeId: $row['youtube_id'],
            title: $row['title'],
            duration: (int) $row['duration'],
            queuedBy: $row['queued_by'],
            state: SongState::from($row['state']),
            sort: (int) $row['sort'],
        );
    }
}
