import Graphic from '@arcgis/core/Graphic';
import SearchSource from '@arcgis/core/widgets/Search/SearchSource';
import Polygon from '@arcgis/core/geometry/Polygon';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import store from '../../store';
import { showMapLoader } from '../../actions/mapActions';

const getAdministrativeAreaName = (item) => {
  let title;

  switch (item.adm_level) {
    case '0':
      title = item.name_0 || 'Country';
      break;
    case '1':
      title = item.name_1 || 'State / Region';
      break;
    case '2':
      title = item.name_2 || 'Sub-region';
      break;
    default:
      title = item.name_1 || 'Area';
      break;
  }
  return title;
};

function createAdminAreasSearchSource() {
  return new SearchSource({
    name: 'Administrative Areas',
    placeholder: 'Enter name',

    async getSuggestions(params) {
      const response = await fetch(
        `/map/gadm-admininstrative-boundaries?searchInput=${params.suggestTerm}`
      );
      const { data } = await response.json();

      return data.map((item) => ({
        sourceIndex: 0,
        key: item,
        text: getAdministrativeAreaName(item),
      }));
    },

    async getResults(params) {
      try {
        store.dispatch(showMapLoader(true));

        await new Promise((resolve) => setTimeout(resolve, 0)); // Force the browser to render the loader first

        const item = params.suggestResult?.key;

        if (!item || !item.gfw_geojson) {
          console.warn("No 'gfw_geojson' found in item:", item);
          return [];
        }

        const geojson = JSON.parse(item.gfw_geojson);

        if (geojson.type !== 'MultiPolygon') {
          console.error('GeoJSON is not a MultiPolygon:', geojson);
          return [];
        }

        const polygons = geojson.coordinates.map((polygonCoords) => {
          return new Polygon({
            rings: polygonCoords[0],
            spatialReference: { wkid: 4326 },
          });
        });

        const mergedGeometry = geometryEngine.union(polygons);

        const graphic = new Graphic({
          geometry: mergedGeometry,
          attributes: item,
          symbol: {
            type: 'simple-fill',
            color: [0, 120, 255, 0.3],
            outline: {
              color: [0, 120, 255, 1],
              width: 2,
            },
          },
        });

        return [
          {
            name: getAdministrativeAreaName(item),
            feature: graphic,
          },
        ];
      } catch (err) {
        console.error('Error in getResults:', err);
        return [];
      } finally {
        store.dispatch(showMapLoader(false));
      }
    },
  });
}

export default createAdminAreasSearchSource;
