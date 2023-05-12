import React, { Component } from 'react';
import '../../../css/inlineLoader.scss';

export default class InlineLoader extends Component {
  render() {
    const { size } = this.props;
    const wheelSize = size || 16;

    return (
      <div>
        <div className="inline-loader">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }
}
