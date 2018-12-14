import React, { Component } from 'react';

class Song extends Component {
    constructor(props) {
        super(props);
        this.state = {
            secondsElapsed: 0,
            playState: 'PLAYING',
        };
    }

    componentDidMount() {
        this.timerID = setInterval(
            () => this.tick(),
            1000
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() {
        if (this.state.playState === 'PLAYING') {
            this.setState((state, props) => ({
                secondsElapsed: state.secondsElapsed + 1
            }));
        }
    }

    render() {
        return (
            <div className="songResult" id={'song-' + this.props.id} data-state={this.props.state}>
                <div className="imageWrapper">
                    <img src={'https://i.ytimg.com/vi/' + this.props.id + '/mqdefault.jpg'} />
                </div>
                <div className="contentWrapper">
                    <p className="title">
                        {this.props.title}
                    </p>
                    <progress max={this.props.duration} value={this.state.secondsElapsed}></progress>
                </div>
                <p className="username">{this.props.addedBy}</p>
                <p className="duration">{this.props.duration}</p>
            </div>
        );
    }
}

export default Song;
