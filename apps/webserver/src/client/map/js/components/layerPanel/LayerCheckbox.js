import React, { Component } from 'react';

// Store
import store from '../../store';
import { toggleLayer, showLoading, getLayerInfo } from '../../actions/mapActions';
import { toggleClarkLabsLayers, toggleRaddLayers } from '../../actions/analysisActions';
import { proLayers } from '../../../../common/js/config';

const {
  raddAlertsID,
  soyInCerradoBiome,
  soyOnTreeCoverLoss,
  clarkLabsAquacultureLandCover,
  clarkLabsAquacultureLandChange,
} = proLayers;

// import MapComponent from '../../components/MapComponent';
// import 'map/css/map.scss';

export default class LayerCheckbox extends Component {
  toggleLayer = () => {
    const { layer, visibleLayers } = this.props;
    if (layer.id === soyInCerradoBiome) {
      store.dispatch(toggleLayer(soyOnTreeCoverLoss));
    } else if (layer.id === raddAlertsID) {
      store.dispatch(toggleRaddLayers());
    } else if (layer.id === clarkLabsAquacultureLandCover) {
      // hide clarkLabsAquacultureLandCover if hidding this layer
      if (store.getState().clarkLabsLayers && visibleLayers.includes(clarkLabsAquacultureLandCover)) {
        store.dispatch(toggleLayer(clarkLabsAquacultureLandCover));
      }
      // hide clarkLabsAquacultureLandChange if hidding this layer
      if (store.getState().clarkLabsLayers && visibleLayers.includes(clarkLabsAquacultureLandChange)) {
        store.dispatch(toggleLayer(clarkLabsAquacultureLandChange));
      }
      // show clarkLabsAquacultureLandCover if turning on this layer
      if (!store.getState().clarkLabsLayers) {
        store.dispatch(toggleLayer(clarkLabsAquacultureLandCover));
      }
      store.dispatch(toggleClarkLabsLayers());
    } else {
      store.dispatch(toggleLayer(layer.id));
    }
  };

  showInfo = () => {
    store.dispatch(showLoading(this.props.layer.id));
    store.dispatch(getLayerInfo(this.props.layer));
  };

  showNote = (note) => {
    return <p>{note}</p>;
  };

  cleanSource = (str) => {
    const cleaned = str.replace(/\//g, ' / ');
    return cleaned;
  };

  render() {
    const { layer, visibleLayers } = this.props;
    let checked;
    if (this.props.layer.id === raddAlertsID) {
      checked = !store.getState().raddLayers ? '' : 'active';
    } else if (this.props.layer.id === clarkLabsAquacultureLandCover) {
      checked = !store.getState().clarkLabsLayers ? '' : 'active';
    } else {
      checked = visibleLayers.indexOf(this.props.layer.id) === -1 ? '' : 'active';
    }

    const label = layer.legendConfig.items[0].name;

    // {layer.legendConfig.items && layer.legendConfig.items[0] && layer.legendConfig.items[0].notes ? layer.legendConfig.items[0].notes.map(this.showNote) : null}
    return (
      <div className={`layer-checkbox relative ${checked} ${layer.group}`}>
        <span onClick={this.toggleLayer.bind(this)} className="toggle-switch pointer">
          <span />
        </span>
        <span onClick={this.toggleLayer.bind(this)} className="layer-checkbox-label pointer">
          {label}
        </span>
        <span
          className={`info-icon metadata-layer-panel layer-panel pointer ${
            this.props.iconLoading === this.props.layer.id ? 'iconLoading' : ''
          }`}
          onClick={this.showInfo}
        >
          <svg>
            <use xlinkHref="#shape-info" />
          </svg>
        </span>
        {layer.legendConfig.items && layer.legendConfig.items[0] && layer.legendConfig.items[0].source ? (
          <span className="layer-sub-info">{this.cleanSource(layer.legendConfig.items[0].source)}</span>
        ) : null}
      </div>
    );
  }
}
