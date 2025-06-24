import SearchSource from '@arcgis/core/widgets/Search/SearchSource';
import store from '../../store';
import { showMapLoader } from '../../actions/mapActions';
import { createResultsGraphic } from './searchUtils';

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
      store.dispatch(showMapLoader(true));
      try {
        const item = params.suggestResult?.key;

        if (!item || !item.gfw_geojson) {
          console.warn("No 'gfw_geojson' found in item:", item);
          return [];
        }

        return [
          {
            name: getAdministrativeAreaName(item),
            feature: await createResultsGraphic(item),
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
