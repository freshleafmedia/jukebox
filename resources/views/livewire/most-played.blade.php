<div wire:poll.1s>
    @foreach($songs as $song)
        <div wire:click="queueSong('{{ $song->youTubeId  }}')" style="display: flex; align-items: center; cursor: pointer">
            <div @style(['width: 80px; text-align: center', 'font-size: 2.2rem' => $loop->index === 0, 'font-size: 1.8rem' => $loop->index === 1, 'font-size: 1.5rem' => $loop->index === 2])>
                #{{ $loop->index + 1 }}
            </div>

{{--            <div style="background: #333; color: #FFF; position: absolute; z-index: 10; border-radius: 10px; font-weight: 900; font-size: 0.8rem; padding: 5px 10px;">#{{ $loop->index + 1 }}</div>--}}

            <div style="flex-grow: 10;">
                <x-song :song="$song" :key="'s-'.$song->youTubeId" />
            </div>
        </div>
    @endforeach
</div>
