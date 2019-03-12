import React, { Component } from 'react';
import {default as Card} from './Card'
import {Chip} from '@material-ui/core';

class Player extends Component {
    state = {

    }

    render() {
        let {name, cards, id, isWinner} = this.props.player
        let {status} = this.props
        return (
            <div className={`Player slot-${id}`}>
                <div className='card-area'>
                    {!!cards && cards.map((k,i) =>
                        <Card key={i} image={k.image} status={status} />
                    )}
                    {!!isWinner &&
                        <span className="is-winner">WIN</span>
                    }
                </div>
                <div>
                    <Chip label={`${name}`}/>
                </div>
            </div>
        );
    }
}

export default Player;