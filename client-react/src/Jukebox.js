import React, { Component } from 'react';

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
                <div className="queue-container"></div>
            </div>

            <div className="playlists toBeBuilt">
                <div className="playlist-item">
                    <span className="number">Q</span>
                    <p className="name">The Request list</p>
                </div>
                <div className="playlist-item">
                    <span className="number">1</span>
                    <p className="name">The Awesome playlist</p>
                </div>
                <div className="playlist-item">
                    <span className="number">2</span>
                    <p className="name">The Awesome playlist</p>
                </div>
                <div className="playlist-item">
                    <span className="number">3</span>
                    <p className="name">The Awesome playlist</p>
                </div>
                <div className="playlist-item">
                    <span className="number">4</span>
                    <p className="name">The Awesome playlist</p>
                </div>
                <div className="playlist-item">
                    <span className="number">5</span>
                    <p className="name">The Awesome playlist</p>
                </div>
                <div className="playlist-item">
                    <span className="number">6</span>
                    <p className="name">The Awesome playlist</p>
                </div>
                <div className="playlist-item">
                    <span className="number">7</span>
                    <p className="name">The Awesome playlist</p>
                </div>
                <div className="playlist-item">
                    <span className="number">8</span>
                    <p className="name">The Awesome playlist</p>
                </div>
                <div className="playlist-item">
                    <span className="number">9</span>
                    <p className="name">The Awesome playlist</p>
                </div>

            </div>
            <section id="footer">Lovingly Crafted by Team Freshleaf</section>
        </div>
    );
  }
}

export default Jukebox;
