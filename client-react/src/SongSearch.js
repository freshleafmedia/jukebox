import React, { Component } from 'react';
import Modal from 'react-modal';

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
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }

    afterOpenModal() {
    }

    closeModal() {
        this.setState({modalIsOpen: false});
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
                                <input type="text" id="search" autoFocus={true}/>
                            </div>
                            <div id="search-container"></div>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default SongSearch;
