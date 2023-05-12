<div
    id="song-{{ $key }}"
    data-state="{{ $song->state?->value }}"
    @class([
        'songResult',
        'inqueue' => $song->queuedBy !== null,
    ])
>
    <div class="imageWrapper">
        <img src="https://i.ytimg.com/vi/{{ $song->youTubeId }}/mqdefault.jpg">
    </div>

    <div class="contentWrapper">
        <p class="title">
            {{ $song->title }}
        </p>

        <span class="status">
            @if($song->state === \App\Enums\SongState::DOWNLOADING || $song->state === \App\Enums\SongState::DOWNLOAD_REQUIRED)
                Downloading...
            @endif
            @if($song->state === \App\Enums\SongState::DOWNLOAD_FAILED)
                Download Failed
            @endif
        </span>
    </div>

    @if ($song->queuedBy !== null)
        <p class="username">{{ $song->queuedBy }}</p>
    @endif

    <p class="duration">{{ $song->getDurationForHumans() }}</p>

    @if($song->state === \App\Enums\SongState::PLAYING || $song->state === \App\Enums\SongState::PAUSED)
        <progress max="{{ $song->duration->totalSeconds }}" value="{{ $song->getElapsedTime() ?? '0' }}"></progress>
    @endif
</div>
