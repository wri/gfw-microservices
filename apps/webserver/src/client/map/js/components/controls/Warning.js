import * as analysisActions from '../../actions/analysisActions';
import store from '../../store';
import '../../../css/controlPanel.scss';
import { Component } from 'react';

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
          <p>
            In order to draw a polygon and analyze the location, please select one of the following
            layers to enable the analysis tool: Tree cover loss, Tree cover gain, Tree biomass loss,
            GLAD-L, GLAD-S2 or VIIRS.
          </p>
        </div>
      </div>
    );
  }
}
