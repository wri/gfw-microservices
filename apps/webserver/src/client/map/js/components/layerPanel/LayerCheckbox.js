import { Component } from 'react';
import store from '../../store';
import { toggleLayer, showLoading, getLayerInfo } from '../../actions/mapActions';
import { toggleClarkLabsLayers } from '../../actions/analysisActions';
import { proLayers } from '../../../../common/js/proLayers.config';

const { clarkLabsAquacultureLandCover, clarkLabsAquacultureLandChange } = proLayers;
export default class LayerCheckbox extends Component {
  toggleLayer = () => {
    const { layer, visibleLayers } = this.props;
    const layerId = layer.id;
    const state = store.getState();
    const isClarkLabsLayer = layerId === clarkLabsAquacultureLandCover;

    if (isClarkLabsLayer) {
      const clarkLayers = [clarkLabsAquacultureLandCover, clarkLabsAquacultureLandChange];
      // Hide any visible Clark Labs layers if currently visible
      if (state.clarkLabsLayers) {
        clarkLayers.forEach((id) => {
          if (visibleLayers.includes(id)) {
            store.dispatch(toggleLayer(id));
          }
        });
      }
      // Show Clark Labs land cover if currently hidden
      if (!state.clarkLabsLayers) {
        store.dispatch(toggleLayer(clarkLabsAquacultureLandCover));
      }

      store.dispatch(toggleClarkLabsLayers());
    } else {
      store.dispatch(toggleLayer(layerId));
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
    if (this.props.layer.id === clarkLabsAquacultureLandCover) {
      checked = !store.getState().clarkLabsLayers ? '' : 'active';
    } else {
      checked = visibleLayers.indexOf(this.props.layer.id) === -1 ? '' : 'active';
    }

    const label = layer.legendConfig.items[0].name;
    const isInfoButtonVisible = !!layer.metadataId;

    // {layer.legendConfig.items && layer.legendConfig.items[0] && layer.legendConfig.items[0].notes ? layer.legendConfig.items[0].notes.map(this.showNote) : null}
    return (
      <div className={`layer-checkbox relative ${checked} ${layer.group}`}>
        <span onClick={this.toggleLayer.bind(this)} className="toggle-switch pointer">
          <span />
        </span>
        <span onClick={this.toggleLayer.bind(this)} className="layer-checkbox-label pointer">
          {label}
        </span>
        {isInfoButtonVisible && (
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
        )}
        {layer.legendConfig.items &&
        layer.legendConfig.items[0] &&
        layer.legendConfig.items[0].source ? (
          <span className="layer-sub-info">
            {this.cleanSource(layer.legendConfig.items[0].source)}
          </span>
        ) : null}
      </div>
    );
  }
}
