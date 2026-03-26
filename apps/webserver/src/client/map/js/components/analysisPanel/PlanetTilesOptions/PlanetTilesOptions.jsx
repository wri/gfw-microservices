import { useEffect, useState } from 'react';
import axios from 'axios';

import store from '../../../store';
import { updatePlanetTileLayer, updatePlanetTileColor } from '../../../actions/mapActions';

import './PlanetTilesOptions.scss';

const transifex = Transifex.live.translateText;

export const PlanetTilesOptions = () => {
  const [planetTiles, setPlanetTiles] = useState();
  const [planetColor, setPlanetColor] = useState(() => store.getState().planetTileColor);
  const [selectedVisualTile, setSelectedVisualTile] = useState(null);
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

      // Build a mapping from yearMonth (YYYY-MM) to analytic mosaic name.
      // Analytic mosaics support proc=cir (False Color); visual ones (global_monthly) do not.
      // Broaden the filter to catch any mosaic with 'analytic' in its name (handles both
      // 'planet_medres_normalized_analytic_YYYY-MM_mosaic' and newer naming conventions).
      // The date regex handles both dash-separated (2025-03) and underscore-separated (2025_03) formats.
      const analyticMap = {};
      mosaics
        .filter((tile) => !tile.name.includes('global_monthly') && tile.name.includes('analytic'))
        .forEach((tile) => {
          const match = tile.name.match(/\d{4}[-_]\d{2}/);
          const yearMonth = match && match[0]?.replace(/_/g, '-');
          if (yearMonth && !analyticMap[yearMonth]) {
            analyticMap[yearMonth] = tile.name;
          }
        });

      const reversedTiles = tilesInfo.reverse();
      setPlanetTiles(reversedTiles);
      setAnalyticMosaicMap(analyticMap);

      // Resolve the stored tile to a visual tile name (it may be analytic if CIR was previously selected).
      const storedLayer = store.getState().planetTileLayer;
      if (storedLayer.includes('global_monthly')) {
        setSelectedVisualTile(storedLayer);
      } else {
        // It's an analytic tile; extract YYYY-MM and find the matching visual tile.
        const analyticMatch = storedLayer.match(/\d{4}-\d{2}/);
        const yearMonth = analyticMatch && analyticMatch[0];
        const matchingVisual = reversedTiles.find((t) => t.yearMonth === yearMonth);
        setSelectedVisualTile(matchingVisual?.tileName ?? reversedTiles[0]?.tileName ?? null);
      }
    });
  }, []);

  // Use yearMonth from tileInfo to avoid re-parsing dates in the analytic lookup.
  const getAnalyticTile = (visualTileName) => {
    if (!visualTileName || !planetTiles) {
      return null;
    }
    const tileInfo = planetTiles.find((t) => t.tileName === visualTileName);
    return tileInfo?.yearMonth ? analyticMosaicMap[tileInfo.yearMonth] : null;
  };

  // Re-dispatch the correct analytic layer once analyticMosaicMap is populated,
  // in case the user switched to CIR before the async fetch completed.
  useEffect(() => {
    if (planetColor === 'cir' && Object.keys(analyticMosaicMap).length > 0 && selectedVisualTile) {
      const analyticTile = getAnalyticTile(selectedVisualTile);
      if (analyticTile) {
        store.dispatch(updatePlanetTileLayer(analyticTile));
      }
    }
  }, [analyticMosaicMap]);

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
  const hasAnalyticMosaics = Object.keys(analyticMosaicMap).length > 0;

  return (
    <div className="planet-options">
      <select onChange={(evt) => handlePlanetTile(evt)} value={selectedVisualTile || ''}>
        {planetTiles &&
          planetTiles.map((tileInfo) => {
            return (
              <option key={tileInfo.tileName} value={tileInfo.tileName}>
                {tileInfo.label}
              </option>
            );
          })}
      </select>
      <select
        onChange={(e) => handlePlanetColorChange(e.target.value)}
        value={planetColor}
        disabled={!hasAnalyticMosaics}
      >
        <option key={'rgb'} value={'rgb'}>
          {naturalColorString}
        </option>
        <option key={'cir'} value={'cir'} disabled={!hasAnalyticMosaics}>
          {falseColorString}
        </option>
      </select>
    </div>
  );
};
