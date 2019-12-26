import React, { Component } from 'react';
import Modal from 'react-modal';
import Song from "./Song";

Modal.setAppElement('#root');

class SongSearch extends Component {
    public props: {
        resultSelect: Function
    };
    public state: {
        results: {id: string, duration: string, title: string}[],
        modalIsOpen: boolean,
    };

    constructor(props) {
        super(props);

        this.state = {
            modalIsOpen: false,
            results: [],
        };

        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.search = this.search.bind(this);
        this.loadAdditionalDetails = this.loadAdditionalDetails.bind(this);
        this.resultClick = this.resultClick.bind(this);
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }

    afterOpenModal() {
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }

    search(term: string) {

        fetch("https://www.googleapis.com/youtube/v3/search?type=video,contentDetails&part=snippet&maxResults=25&key=AIzaSyAb6cFueDaWaZkNE6iEpYSHGj31k7aFiFg&q="+term)
            .then(response => response.json())
            .then(response => {

                const results = response.items.map(item => {
                    return {
                        id: item.id.videoId,
                        title: item.snippet.title,
                    }
                });

                this.setState({
                    results: results,
                });

                this.loadAdditionalDetails();
            })
            .catch(e => {
                console.error(e);
            });
    }

    loadAdditionalDetails() {
        const ids = this.state.results.map(result => result.id);

        fetch("https://www.googleapis.com/youtube/v3/videos?part=contentDetails&maxResults=25&key=AIzaSyAb6cFueDaWaZkNE6iEpYSHGj31k7aFiFg&id="+ids.join(','))
            .then(response => response.json())
            .then(response => {

                const detailedResults = this.state.results.map(result => {
                    const details = response.items.find(item => item.id === result.id).contentDetails;

                    result.duration = details.duration;

                    return result;
                });

                this.setState({
                    results: detailedResults,
                })
            })
            .catch(e => {
                console.error(e);
            });
    }

    resultClick(e) {
        const songId = e.target.closest('.songResult').getAttribute('id').replace('song-', '');

        this.props.resultSelect(songId);
    }

    render() {
        const resultElements = this.state.results.map(result => {
            return <Song key={result.id} id={result.id} title={result.title} duration={result.duration} />
        });

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
                                <input type="text" id="search" onInput={e => this.search(e.currentTarget.value)} autoFocus={true}/>
                            </div>
                            <div id="search-container" onClick={this.resultClick}>
                                {resultElements}
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default SongSearch;
