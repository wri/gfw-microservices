import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';

import store from '../../../../../map/js/store';
import { updatePlanetTileLayer, updatePlanetTileColor } from '../../../actions/mapActions';

import './PlanetTilesOptions.scss';

export const PlanetTilesOptions = () => {
  const [planetTiles, setPlanetTiles] = useState();
  const [planetColor, setPlanetColor] = useState('rgb');
  const [selectedPlanetTileLayer, setSelectedPlanetTileLayer] = useState();

  useEffect(() => {
    axios.get(`${window.location.origin}/map/getPlanetTilesInfo`).then((response) => {
      const tilesInfo = response.data.mosaics
        .filter((tile) => tile.name.includes('planet_medres_normalized_analytic'))
        .map((tile) =>
          tile.name
            .replace('planet_medres_normalized_analytic_', '')
            .replace('_mosaic', '')
            .split('_')
            .map((tileInfo) => ({
              tileName: tile.name,
              label: moment(tileInfo).format('MMM YYYY'),
            }))
        );
      setPlanetTiles(tilesInfo.reverse());
    });

    store.subscribe(() => {
      const { planetTileLayer } = store.getState();
      setSelectedPlanetTileLayer(planetTileLayer);
    });
  }, []);

  const handlePlanetTile = (evt) => {
    store.dispatch(updatePlanetTileLayer(evt.target.value));
  };

  const handlePlanetColorChange = (val) => {
    const { planetTileLayer } = store.getState();
    setPlanetColor(val);
    store.dispatch(updatePlanetTileColor(val));
    store.dispatch(updatePlanetTileLayer(planetTileLayer));
  };

  return (
    <div className="planet-options">
      <select onChange={(evt) => handlePlanetTile(evt)} value={selectedPlanetTileLayer}>
        {planetTiles &&
          planetTiles.map((tileInfo) => {
            return (
              <option key={tileInfo[0].tileName} value={tileInfo[0].tileName}>
                {tileInfo[0].label}
                {tileInfo.length > 1 && ` - ${tileInfo[1].label}`}
              </option>
            );
          })}
      </select>
      <select onChange={(e) => handlePlanetColorChange(e.target.value)} value={planetColor}>
        <option key={'rgb'} value={'rgb'}>
          Natural color
        </option>
        <option key={'cir'} value={'cir'}>
          False color
        </option>
      </select>
    </div>
  );
};
