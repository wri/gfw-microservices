import SearchSource from '@arcgis/core/widgets/Search/SearchSource';
import store from '../../store';
import { showMapLoader } from '../../actions/mapActions';
import { createResultsGraphic } from './searchUtils';

function createSearchSource(sourceName, url, displayName, sourceIndex) {
  return new SearchSource({
    name: sourceName,
    placeholder: 'Enter name',

    async getSuggestions(params) {
      const response = await fetch(`${url}?searchInput=${params.suggestTerm}`);
      const { data } = await response.json();
      return data.map((item) => ({
        sourceIndex, // Needed to distinguish source
        key: item,
        text: displayName(item),
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
            name: displayName(item),
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

export default createSearchSource;
