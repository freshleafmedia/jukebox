import React, {Component} from 'react';
import Queue from "./Queue";
import SongSearch from "./SongSearch";
import openSocket from 'socket.io-client';
import MediaControls from "./MediaControls";
import Song from "./Song";

class Jukebox extends Component {
    protected socket: SocketIOClient.Socket;
    public state: {playState: string, songs: Song[]};

    constructor(props: []) {
        super(props);

        this.state = {
            playState: 'playing',
            songs: [],
        };

        this.socket = openSocket('//:3000');

        this.socket.on('playlist', (playlistData: any) => {
            const songs = playlistData.songs.map((song: any) => {
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

        this.socket.on('jukeboxState', (newState: string) => {
            const oppositeState = newState === 'playing' ? 'paused':'playing';

            const songs = this.state.songs.map((song: any) => {
                if (song.playState === oppositeState) {
                    song.playState = newState;
                }

                return song;
            });

            this.setState({
                songs: songs,
            })
        });

        this.socket.on('songPosition', (position: number) => {
            const songs = this.state.songs.map((song: any) => {
                if (song.playState === 'playing') {
                    song.secondsElapsed = position;
                }

                return song;
            });

            this.setState({
                songs: songs,
            })
        });

        this.socket.on('songRemove', (removedSong: any) => {
            const songs = this.state.songs.filter((song: any) => {
                return song.id !== removedSong.id;
            });

            this.setState({
                songs: songs,
            })
        });

        this.socket.on('songStatus', (song: Song) => {
            console.log(song);
        });

        this.mediaControlClick = this.mediaControlClick.bind(this);
        this.addSong = this.addSong.bind(this);
    }

    mediaControlClick(e) {
        const action = e.target.dataset.action;

        this.socket.emit('control', action);
    }

    addSong(songId) {
        this.socket.emit('addsong', {id: songId});
    }

    render() {
        return (
            <div id="wrapper">
                <header>
                    <div className="masthead">
                        <h1>Freshleaf Jukebox</h1>
                        <SongSearch resultSelect={this.addSong} />
                    </div>
                    <MediaControls onClick={this.mediaControlClick} songs={this.state.songs}/>
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
