import React, { Component } from 'react';

class Song extends Component {
    getDurationInSeconds() {
        let duration = this.props.duration;

        if (typeof duration === 'undefined') {
            return null;
        }

        duration = duration.replace('PT', '');
        var hours = duration.indexOf('H') !== -1 ? parseInt(duration.split('H')[0]) : 0;
        var minutes = duration.indexOf('M') !== -1 ? parseInt(duration.split('M')[0]) : 0;
        var seconds = duration.indexOf('S') !== -1 ? parseInt(duration.split('S')[0]) : 0;

        return (hours * 3600) + (minutes * 60) + seconds;
    }

    prettyDuration() {
        const durationSeconds = this.getDurationInSeconds();

        const hours = Math.floor(durationSeconds / 3600);
        const minutes = Math.floor((durationSeconds - (hours * 3600)) / 60);
        const seconds = durationSeconds - (hours * 3600) - (minutes * 60);

        function str_pad_left(string,pad,length) {
            return (new Array(length+1).join(pad)+string).slice(-length);
        }

        var display = "";
        if (hours > 0) {
            display += hours + ":";
        }
        if (hours > 0 || minutes > 0) {
            if (hours > 0) {
                display += str_pad_left(minutes, "0", 2);
            } else {
                display += minutes;
            }
            display += ":";
        }
        if (hours > 0 || minutes > 0 || seconds > 0) {
            if (hours > 0 || minutes > 0) {
                display += str_pad_left(seconds, "0", 2);
            } else {
                display += seconds;
            }
        }
        return display;
    }

    render() {
        return (
            <div className="songResult" id={'song-' + this.props.id} data-state={this.props.playState}>
                <div className="imageWrapper">
                    <img src={'https://i.ytimg.com/vi/' + this.props.id + '/mqdefault.jpg'} />
                </div>
                <div className="contentWrapper">
                    <p className="title">
                        {this.props.title}
                    </p>
                    <progress max={this.getDurationInSeconds()} value={this.props.secondsElapsed}></progress>
                </div>
                {this.props.addedBy ? <p className="username">{this.props.addedBy}</p>:null }
                {typeof this.props.duration !== 'undefined' ? <p className="duration">{this.prettyDuration()}</p>:null }
            </div>
        );
    }
}

export default Song;
