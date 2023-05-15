<div id="search-controls" wire:poll.visible.1s>
    <div class="search-header">
        <strong>Search YouTube</strong>
        <input type="text" id="search" wire:model.lazy="searchTerm">
    </div>

    <div id="search-container">
        <div wire:loading.remove wire:target="searchTerm">
            @foreach($results as $result)
                <div wire:click="queueSong('{{ $result->youTubeId  }}')">
                    <x-song :song="$result" :key="'s-'.$result->youTubeId" />
                </div>
            @endforeach
        </div>
    </div>
</div>
