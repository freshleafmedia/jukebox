import React, {Component} from 'react';
import Queue from "./Queue";
import SongSearch from "./SongSearch";
import openSocket from 'socket.io-client';

class Jukebox extends Component {

    constructor(props) {
        super(props);

        this.state = {
            playState: 'playing',
            songs: [],
        };

        this.socket = openSocket('//:3000');

        this.socket.on('playlist', playlistData => {
            const songs = playlistData.songs.map(song => {
                return {
                    id: song.id,
                    title: song.data.title,
                    addedBy: song.username,
                    duration: 'PT' + song.data.duration + 'S',
                    playState: song.state,
                }
            });

            this.setState({
                songs: songs,
            })
        });

        this.socket.on('songPosition', position => {
            const songs = this.state.songs.map(song => {
                if (song.playState === 'playing') {
                    song.secondsElapsed = position;
                }

                return song;
            });

            this.setState({
                songs: songs,
            })
        });

        this.mediaControlClick = this.mediaControlClick.bind(this);
    }

    mediaControlClick(e) {
        const action = e.target.dataset.action;

        switch (action) {
            case 'play':
                this.play();
                break;
            case 'pause':
                this.pause();
                break;
        }
    }

    play() {
        const pausedSongs = this.state.songs.map(song => {
            if (song.playState === 'paused') {
                song.playState = 'playing'
            }

            return song;
        });

        this.setState({
            playState: 'playing',
            songs: pausedSongs,
        })
    }

    pause() {
        const pausedSongs = this.state.songs.map(song => {
            if (song.playState === 'playing') {
                song.playState = 'paused'
            }

            return song;
        });

        this.setState({
            playState: 'paused',
            songs: pausedSongs,
        })
    }

    render() {
        return (
            <div id="wrapper">
                <header>
                    <div className="masthead">
                        <h1>Freshleaf Jukebox</h1>
                        <SongSearch />
                    </div>
                    <div className="media-controls">
                        <button onClick={this.mediaControlClick} className="btn media disabled" data-action="prev" id="rewindButton"></button>
                        <button onClick={this.mediaControlClick} className={'btn media ' + (this.state.playState === 'playing' ? 'disabled':'')} data-action="play" id="playButton"></button>
                        <button onClick={this.mediaControlClick} className={'btn media ' + (this.state.playState === 'paused' ? 'disabled':'')} data-action="pause" id="pauseButton"></button>
                        <button onClick={this.mediaControlClick} className="btn media disabled" data-action="voldown" id="voldownButton"></button>
                        <button onClick={this.mediaControlClick} className="btn media disabled" data-action="volup" id="volupButton"></button>
                        <button onClick={this.mediaControlClick} className="btn media disabled" data-action="next" id="forwardButton"></button>
                    </div>
                </header>

                <div className="queue">
                    <p><strong>Whats on the list?</strong></p>
                    <button onClick={this.mediaControlClick} id="shuffleSongs" className="disabled" data-action="randomise"></button>
                    <Queue songs={this.state.songs}/>
                </div>

                <section id="footer">Lovingly Crafted by Team Freshleaf</section>
            </div>
        );
    }
}

export default Jukebox;
