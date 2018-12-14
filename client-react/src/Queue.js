import React, { Component } from 'react';
import Song from "./Song";

class Queue extends Component {
    render() {
        const songElements = this.props.songs.map(song => {
            return <Song key={song.id} id={song.id} title={song.title} addedBy={song.addedBy} duration={song.duration} playState={song.playState}/>
        });

        return (
            <div className="queue-container">
                {songElements}
            </div>
        );
    }
}

export default Queue;
