import React, { Component } from 'react';
import Song from "./Song";

class Queue extends Component {
    public props: {
        songs: Song[],
    };

    render() {
        const songElements = this.props.songs.map((song: Song) => {
            return <Song key={song.props.id} id={song.props.id} title={song.props.title} addedBy={song.props.addedBy} duration={song.props.duration} playState={song.props.playState} secondsElapsed={song.props.secondsElapsed}/>
        });

        return (
            <div className="queue-container">
                {songElements}
            </div>
        );
    }
}

export default Queue;
