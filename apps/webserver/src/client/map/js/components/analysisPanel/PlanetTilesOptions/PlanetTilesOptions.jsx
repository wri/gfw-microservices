import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

import store from '../../../store';
import { updatePlanetTileLayer, updatePlanetTileColor } from '../../../actions/mapActions';

import './PlanetTilesOptions.scss';

const transifex = Transifex.live.translateText;

export const PlanetTilesOptions = () => {
  const [planetTiles, setPlanetTiles] = useState();
  const [planetColor, setPlanetColor] = useState('rgb');
  const [selectedPlanetTileLayer, setSelectedPlanetTileLayer] = useState();

  useEffect(() => {
    axios.get(`${window.location.origin}/map/getPlanetTilesInfo`).then((response) => {
      const tilesInfo = response.data.mosaics
        .filter((tile) => tile.name.includes('global_monthly'))
        .map((tile) => {
          // sample tile name: global_monthly_2023-01_mosaic
          const match = tile.name.match(/\d{4}_\d{2}/);
          const yearAndMonth = match && match[0]?.replace(/_/g, '-');
          const res = {
            tileName: tile.name,
            // Parse as UTC to avoid timezone issues
            label: format(new Date(`${yearAndMonth}-01T00:00:00Z`), 'MMM yyyy'),
          };
          return res;
        });
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

  const naturalColorString = transifex('Natural color');
  const falseColorString = transifex('False color');

  return (
    <div className="planet-options">
      <select onChange={(evt) => handlePlanetTile(evt)} value={selectedPlanetTileLayer}>
        {planetTiles &&
          planetTiles.map((tileInfo) => {
            return (
              <option key={tileInfo.tileName} value={tileInfo.tileName}>
                {tileInfo.label}
              </option>
            );
          })}
      </select>
      <select onChange={(e) => handlePlanetColorChange(e.target.value)} value={planetColor}>
        <option key={'rgb'} value={'rgb'}>
          {naturalColorString}
        </option>
        <option key={'cir'} value={'cir'}>
          {falseColorString}
        </option>
      </select>
    </div>
  );
};
