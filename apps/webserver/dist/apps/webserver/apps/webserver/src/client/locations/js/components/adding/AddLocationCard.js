import React, { Component } from 'react';

import '../../../css/AddLocationCard.scss';

export default class AddLocationCard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const cardClasses = this.props.cardClasses ? this.props.cardClasses : '';

    return (
      <div className={cardClasses + ' add-location-card'}>
        <div className="add-location-card__inner">{this.props.children}</div>
      </div>
    );
  }
}
