<div wire:poll.1s>
    <div id="background"></div>
    <div id="wrapper">
        <header class="">
            <div class="masthead">
                <h1>Freshleaf Jukebox</h1>
                <button class="btn" id="addButton" wire:click="$set('addSongIsVisible', true)">Add Song</button>
            </div>

            <!-- Media Control buttons -->
            <div class="media-controls">
                <button class="btn media" id="playButton" wire:click="play" @disabled($activeSong === null || $activeSong->state === \App\Enums\SongState::PLAYING)></button>
                <button class="btn media" id="pauseButton" wire:click="pause" @disabled($activeSong === null || $activeSong->state === \App\Enums\SongState::PLAYABLE || $activeSong->state === \App\Enums\SongState::PAUSED)></button>
                <button class="btn media" id="voldownButton" wire:click="volumeDown" @disabled($activeSong === null || $activeSong->state === \App\Enums\SongState::PLAYABLE)></button>
                <button class="btn media" id="volupButton" wire:click="volumeUp" @disabled($activeSong === null || $activeSong->state === \App\Enums\SongState::PLAYABLE)></button>
                <button class="btn media" id="forwardButton" wire:click="skip" @disabled($activeSong === null || $activeSong->state === \App\Enums\SongState::PLAYABLE)></button>
                <button class="btn media" id="shuffleButton" wire:click="shuffle" @disabled($queuedSongs->isEmpty())></button>
            </div>
        </header>

        <!-- Queue -->

        <div class="queue">
            <p><strong>Whats on the list?</strong></p>

            <div class="queue-container">
                @foreach($queuedSongs as $song)
                    <x-song :song="$song" :key="'q-'.$song->youTubeId" />
                @endforeach
            </div>
        </div>

        <section id="footer">Lovingly Crafted by Team Freshleaf</section>
    </div>

    <!-- Fixed buttons/content -->

    <a href="https://github.com/freshleafmedia/jukebox" target="_blank" class="github-banner" title="Fork me on GitHub">
        <img
            src="https://camo.githubusercontent.com/52760788cde945287fbb584134c4cbc2bc36f904/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f77686974655f6666666666662e706e67"
            alt="Fork me on GitHub"
            data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_white_ffffff.png">
    </a>

    <!-- Dialogue box -->
    <div id="addDialog" class="dialog" @style(['display: none' => $addSongIsVisible === false])>
        <div class="overlay" wire:click="$set('addSongIsVisible', false)"></div>
        <div class="overlay-wrapper">
            <button id="addDialogClose" wire:click="$set('addSongIsVisible', false)">X</button>
            <div id="user-setup" style="display: none;">
                <form id="addUser">
                    <strong>Set Name</strong>
                    <input type="text" id="username">
                </form>
            </div>
            <div id="user-area" style="">
                <div class="tabs">
                    <ul>
                        <li><a href="#" wire:click="$set('addSongTabActive', 'search')" @class(['current' => $addSongTabActive === 'search'])>Search</a></li>
                        <li><a href="#" wire:click="$set('addSongTabActive', 'mostPlayed')" @class(['current' => $addSongTabActive === 'mostPlayed'])>Top 20</a></li>
                    </ul>
                    <div @style(['display: none' => $addSongTabActive !== 'search'])>
                        <livewire:search/>
                    </div>
                    <div @style(['display: none' => $addSongTabActive !== 'mostPlayed'])>
                        <livewire:most-played/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
