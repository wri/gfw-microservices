import { useEffect, useState } from 'react';
import axios from 'axios';

import store from '../../../store';
import { updatePlanetTileLayer } from '../../../actions/mapActions';
import './PlanetTilesOptions.scss';

export const PlanetTilesOptions = () => {
  const [planetTiles, setPlanetTiles] = useState();
  const [selectedTile, setSelectedTile] = useState(null);

  useEffect(() => {
    axios.get(`${window.location.origin}/map/getPlanetTilesInfo`).then((response) => {
      const tilesInfo = response.data.mosaics
        .filter((tile) => tile.name.includes('global_monthly'))
        .map((tile) => {
          // sample tile name: global_monthly_2025_03_mosaic
          const match = tile.name.match(/\d{4}_\d{2}/);
          const yearAndMonth = match && match[0]?.replace(/_/g, '-');
          // Format month/year in a timezone-agnostic way using UTC, so the label is always
          // correct regardless of user timezone.
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
          return { tileName: tile.name, label };
        });

      const reversedTiles = tilesInfo.reverse();
      setPlanetTiles(reversedTiles);

      const storedLayer = store.getState().planetTileLayer;
      const matching = reversedTiles.find((t) => t.tileName === storedLayer);
      const initialSelection = matching?.tileName ?? reversedTiles[0]?.tileName ?? null;
      setSelectedTile(initialSelection);
      if (initialSelection && initialSelection !== storedLayer) {
        store.dispatch(updatePlanetTileLayer(initialSelection));
      }
    });
  }, []);

  const handleChange = (evt) => {
    const tile = evt.target.value;
    setSelectedTile(tile);
    store.dispatch(updatePlanetTileLayer(tile));
  };

  return (
    <select onChange={handleChange} value={selectedTile || ''}>
      {planetTiles?.map((tileInfo) => (
        <option key={tileInfo.tileName} value={tileInfo.tileName}>
          {tileInfo.label}
        </option>
      ))}
    </select>
  );
};
