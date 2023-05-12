import * as analysisActions from '../../actions/analysisActions';
import store from '../../store';
import '../../../css/controlPanel.scss';
import React, { Component } from 'react';

export default class ControlPanel extends Component {
  toggleWarning = () => {
    store.dispatch(analysisActions.toggleWarning());
  };

  render() {
    const { visible } = this.props;

    return (
      <div className={`notifications-warning ${visible ? 'active-warning' : ''}`}>
        <div title="close" className="close-icon pointer" onClick={this.toggleWarning}>
          <svg>
            <use xlinkHref="#shape-close" />
          </svg>
        </div>
        <div className="notifications-content">
          <svg>
            <use xlinkHref="#icon-warning" />
          </svg>
          <p>Please turn on a Forest Change layer to analyze before using the analysis tool.</p>
        </div>
      </div>
    );
  }
}
