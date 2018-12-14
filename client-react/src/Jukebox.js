import React, {Component} from 'react';
import Queue from "./Queue";

class Jukebox extends Component {
    render() {
        return (
            <div id="wrapper">
                <header>
                    <div className="masthead">
                        <h1>Freshleaf Jukebox</h1>
                        <button className="btn" id="addButton">Add Song</button>
                    </div>
                    <div className="media-controls">
                        <button className="btn media disabled" data-action="prev" id="rewindButton"></button>
                        <button className="btn media disabled" data-action="play" id="playButton"></button>
                        <button className="btn media disabled" data-action="pause" id="pauseButton"></button>
                        <button className="btn media disabled" data-action="voldown" id="voldownButton"></button>
                        <button className="btn media disabled" data-action="volup" id="volupButton"></button>
                        <button className="btn media disabled" data-action="next" id="forwardButton"></button>
                    </div>
                </header>

                <div className="queue">
                    <p><strong>Whats on the list?</strong></p>
                    <button id="shuffleSongs" className="disabled" data-action="randomise"></button>
                    <Queue/>
                </div>

                <section id="footer">Lovingly Crafted by Team Freshleaf</section>
            </div>
        );
    }
}

export default Jukebox;
