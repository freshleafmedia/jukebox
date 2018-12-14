import React, { Component } from 'react';

class MediaControls extends Component {

    playIsEnabled () {
        return this.props.songs.length > 0 && typeof this.props.songs.find(song => song.playState === 'playing') === 'undefined';
    }

    pauseIsEnabled () {
        return this.props.songs.length > 0 && typeof this.props.songs.find(song => song.playState === 'paused') === 'undefined';
    }

    volDownIsEnabled () {
        return this.props.songs.length > 0;
    }

    volUpIsEnabled () {
        return this.props.songs.length > 0;
    }

    skipIsEnabled () {
        return this.props.songs.length > 0;
    }

    render() {
        return (
            <div className="media-controls">
                <button onClick={this.props.onClick} className="btn media disabled" data-action="prev" id="rewindButton"></button>
                <button onClick={this.props.onClick} className={'btn media ' + (this.playIsEnabled() ? '':'disabled')} data-action="play" id="playButton"></button>
                <button onClick={this.props.onClick} className={'btn media ' + (this.pauseIsEnabled() ? '':'disabled')} data-action="pause" id="pauseButton"></button>
                <button onClick={this.props.onClick} className={'btn media ' + (this.volDownIsEnabled() ? '':'disabled')} data-action="voldown" id="voldownButton"></button>
                <button onClick={this.props.onClick} className={'btn media ' + (this.volUpIsEnabled() ? '':'disabled')} data-action="volup" id="volupButton"></button>
                <button onClick={this.props.onClick} className={'btn media ' + (this.skipIsEnabled() ? '':'disabled')} data-action="next" id="forwardButton"></button>
            </div>
        );
    }
}

export default MediaControls;
