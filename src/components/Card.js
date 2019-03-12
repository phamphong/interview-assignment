import React, { Component } from 'react';
import CardDown from './card-down.png'

class Card extends Component {
  render() {
    let {image, status} = this.props
    return (
      <span className={`Card`}>
        <img alt="card" width={120} height={167} src={status ? image : CardDown} />
      </span>
    );
  }
}

export default Card;