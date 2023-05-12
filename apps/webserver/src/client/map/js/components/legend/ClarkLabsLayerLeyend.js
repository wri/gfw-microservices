import React from 'react';
import store from '../../store';
import { proLayers } from '../../../../common/js/config';
import { toggleLayer, turnLayerOff } from '../../actions/mapActions';

const { clarkLabsAquacultureLandChange, clarkLabsAquacultureLandCover } = proLayers;

const ClarkLabsLayerLeyend = ({ disabled, landCoverLayer, landChangeLayer }) => {
  const toggleLandCover = async () => {
    if (!disabled) {
      await store.dispatch(toggleLayer(clarkLabsAquacultureLandCover));
      await store.dispatch(turnLayerOff(clarkLabsAquacultureLandChange));
    }
  };

  const toggleLandChange = async () => {
    if (!disabled) {
      await store.dispatch(turnLayerOff(clarkLabsAquacultureLandCover));
      await store.dispatch(toggleLayer(clarkLabsAquacultureLandChange));
    }
  };

  const layerLegendMap = (symbol, i) => {
    const symbolStyle = {
      background: symbol.color,
    };
    return (
      <li key={`${i}${symbol.name}`}>
        <span className="layer-legend-symbol" style={symbolStyle}></span>
        <span className="layer-legend-label">{symbol.name}</span>
      </li>
    );
  };

  return (
    <ul className="layer-legend">
      <li
        key={1}
        className={`layer-checkbox ${
          store.getState().visibleLayers.includes(clarkLabsAquacultureLandCover) ? 'active' : ''
        }`}
      >
        <div>
          <span onClick={toggleLandCover} className="toggle-switch pointer">
            <span />
          </span>
          <span onClick={toggleLandCover} className="layer-checkbox-label pointer">
            Land Cover (2018)
          </span>
        </div>
      </li>
      <li>
        <ul className="layer-legend">{landCoverLayer.legendConfig.items[0].categories.map(layerLegendMap)}</ul>
      </li>

      <li
        key={2}
        className={`layer-checkbox ${
          store.getState().visibleLayers.includes(clarkLabsAquacultureLandChange) ? 'active' : ''
        }`}
      >
        <div>
          <span onClick={toggleLandChange} className="toggle-switch pointer">
            <span />
          </span>
          <span onClick={toggleLandChange} className="layer-checkbox-label pointer">
            Land Change (1999-2018)
          </span>
        </div>
      </li>
      <li>
        <ul className="layer-legend">{landChangeLayer.legendConfig.items[0].categories.map(layerLegendMap)}</ul>
      </li>
    </ul>
  );
};

export default ClarkLabsLayerLeyend;
