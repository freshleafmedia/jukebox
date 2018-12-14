import React, { Component } from 'react';
import Song from "./Song";

class Queue extends Component {
    render(props) {
        return (
            <div className="queue-container">
                <Song id='6aheloAA-TA' title='Thomas' addedBy='Alpha' duration='100' state='playing'/>
            </div>
        );
    }
}

export default Queue;
