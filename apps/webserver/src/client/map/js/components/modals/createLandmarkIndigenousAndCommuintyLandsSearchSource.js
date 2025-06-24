import SearchSource from '@arcgis/core/widgets/Search/SearchSource';
import store from '../../store';
import { showMapLoader } from '../../actions/mapActions';
import { createResultsGraphic } from './searchUtils';

function createLandmarkIndigenousAndCommuintyLandsSearchSource() {
  return new SearchSource({
    name: 'Indigenous or Community land area',
    placeholder: 'Enter name',

    async getSuggestions(params) {
      const response = await fetch(
        `/map/landmark_indigenous_and_community_lands?searchInput=${params.suggestTerm}`
      );
      const { data } = await response.json();
      console.log({ data });
      return data.map((item) => ({
        sourceIndex: 0,
        key: item,
        text: item.name,
      }));
    },

    async getResults(params) {
      store.dispatch(showMapLoader(true));
      const item = params.suggestResult?.key;

      if (!item || !item.gfw_geojson) {
        console.warn("No 'gfw_geojson' found in item:", item);
        return [];
      }
      try {
        return [
          {
            name: item.name,
            feature: createResultsGraphic(item),
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

export default createLandmarkIndigenousAndCommuintyLandsSearchSource;
