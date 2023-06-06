// import {prepareStateForShare} from 'utils/shareUtils';
// import {toQuerystring} from 'utils/params';
import { togglePanels, toggleSearch } from '../../actions/mapActions';
import store from '../../store';
import '../../../css/controlPanel.scss';
import React, { Component } from 'react';

const animationOptions = { duration: 300 };

export default class ControlPanel extends Component {
  toggleSearchModal = () => {
    store.dispatch(toggleSearch());
  };

  togglePanels = () => {
    store.dispatch(togglePanels());
  };

  zoomOut = () => {
    this.props.mapView.goTo({ zoom: this.props.mapView.zoom - 1 }, animationOptions);
  };

  zoomIn = () => {
    this.props.mapView.goTo({ zoom: this.props.mapView.zoom + 1 }, animationOptions);
  };

  render() {
    const { panelsVisible } = this.props;

    return (
      <div className="control-panel map-component shadow">
        <ul className="control-panel__list">
          <li className="control-panel__zoom-out pointer" title="Zoom Out" onClick={this.zoomOut}>
            <svg className="svg-icon">
              <use xlinkHref="#icon-minus" />
            </svg>
          </li>
          <li className="control-panel__zoom-in pointer" title="Zoom In" onClick={this.zoomIn}>
            <svg className="svg-icon">
              <use xlinkHref="#icon-plus" />
            </svg>
          </li>
          <li
            className="control-panel__locate-me pointer"
            title="Search"
            onClick={this.toggleSearchModal}
          >
            <svg className="svg-icon">
              <use xlinkHref="#icon-control-search" />
            </svg>
          </li>
          <li
            className="control-panel__toggle-panels pointer mobile-hide"
            title="Toggle"
            onClick={this.togglePanels}
          >
            {panelsVisible ? (
              <svg className="svg-icon">
                <use xlinkHref="#icon-controls-toggle__on" />
              </svg>
            ) : (
              <svg className="svg-icon">
                <use xlinkHref="#icon-controls-toggle__off" />
              </svg>
            )}
          </li>
        </ul>
      </div>
    );
  }
}
