import { useEffect, useState } from 'react';
import axios from 'axios';

import store from '../../../store';
import { updatePlanetTileLayer, updatePlanetTileColor } from '../../../actions/mapActions';

import './PlanetTilesOptions.scss';

const transifex = Transifex.live.translateText;

export const PlanetTilesOptions = () => {
  const [planetTiles, setPlanetTiles] = useState();
  const [planetColor, setPlanetColor] = useState('rgb');
  const [selectedVisualTile, setSelectedVisualTile] = useState(
    () => store.getState().planetTileLayer
  );
  const [analyticMosaicMap, setAnalyticMosaicMap] = useState({});

  useEffect(() => {
    axios.get(`${window.location.origin}/map/getPlanetTilesInfo`).then((response) => {
      const mosaics = response.data.mosaics;

      const tilesInfo = mosaics
        .filter((tile) => tile.name.includes('global_monthly'))
        .map((tile) => {
          // sample tile name: global_monthly_2025_03_mosaic
          const match = tile.name.match(/\d{4}_\d{2}/);
          const yearAndMonth = match && match[0]?.replace(/_/g, '-');
          // Format month/year in a timezone-agnostic way using UTC, so the label is always correct regardless of user timezone.
          // If the tile name does not match the expected pattern, show 'Invalid date' for easier debugging.
          let label;
          if (yearAndMonth) {
            const [year, month] = yearAndMonth.split('-');
            const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
            label = date.toLocaleString('en-US', {
              month: 'short',
              year: 'numeric',
              timeZone: 'UTC',
            });
          } else {
            label = 'Invalid date';
          }
          return {
            tileName: tile.name,
            label,
            yearMonth: yearAndMonth,
          };
        });

      // Build a mapping from yearMonth to analytic mosaic name.
      // Analytic mosaics support proc=cir (False Color), visual ones (global_monthly) do not.
      const analyticMap = {};
      mosaics
        .filter((tile) => tile.name.includes('planet_medres_normalized_analytic'))
        .forEach((tile) => {
          const match = tile.name.match(/\d{4}-\d{2}/);
          if (match) {
            analyticMap[match[0]] = tile.name;
          }
        });

      const reversedTiles = tilesInfo.reverse();
      setPlanetTiles(reversedTiles);
      setAnalyticMosaicMap(analyticMap);
    });
  }, []);

  const getAnalyticTile = (visualTileName) => {
    if (!visualTileName) {
      return null;
    }
    const match = visualTileName.match(/\d{4}_\d{2}/);
    const yearMonth = match && match[0]?.replace(/_/g, '-');
    return yearMonth ? analyticMosaicMap[yearMonth] : null;
  };

  const getTileLayerForDispatch = (visualTile, color) => {
    if (color === 'cir') {
      return getAnalyticTile(visualTile) || visualTile;
    }
    return visualTile;
  };

  const handlePlanetTile = (evt) => {
    const visualTile = evt.target.value;
    setSelectedVisualTile(visualTile);
    store.dispatch(updatePlanetTileLayer(getTileLayerForDispatch(visualTile, planetColor)));
  };

  const handlePlanetColorChange = (val) => {
    setPlanetColor(val);
    store.dispatch(updatePlanetTileColor(val));
    store.dispatch(updatePlanetTileLayer(getTileLayerForDispatch(selectedVisualTile, val)));
  };

  const naturalColorString = transifex('Natural color');
  const falseColorString = transifex('False color');

  return (
    <div className="planet-options">
      <select onChange={(evt) => handlePlanetTile(evt)} value={selectedVisualTile}>
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
