import React, { Component } from 'react';
import Modal from 'react-modal';
import Song from "./Song";

Modal.setAppElement('#root');

class SongSearch extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalIsOpen: false
        };

        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.search = this.search.bind(this);
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }

    afterOpenModal() {
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }

    search(e) {

        const searchTerm = e.value;

        fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&key=AIzaSyC5ZNaxUE7HwOxi6r5xMq9aeRlUVdJXU7I&q="+searchTerm)
            .then(response => response.json())
            .then(response => this.parseResults(response.items));
    }

    parseResults(results) {
        const resultElements = results.map(result => {
            return <Song key={result.id.videoId} id={result.id.videoId} title={result.snippet.title} />
        });

        this.setState({
            results: resultElements,
        })
    }

    render() {
        return (
            <div>
                <button className="btn" id="addButton" onClick={this.openModal}>Add Song</button>
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    className="dialog"
                    contentLabel="Song Search"
                >
                    <div className="overlay-wrapper">
                        <button id="addDialogClose" onClick={this.closeModal}>X</button>
                        <div id="search-controls">
                            <div className="search-header">
                                <strong>Search YouTube </strong>
                                <input type="text" id="search" onInput={this.search} autoFocus={true}/>
                            </div>
                            <div id="search-container">
                                {this.state.results}
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default SongSearch;
