import Graphic from '@arcgis/core/Graphic';
import { showMapLoader } from '../../actions/mapActions';
import Locator from '@arcgis/core/tasks/Locator';
import SearchSource from '@arcgis/core/widgets/Search/SearchSource';
import store from '../../store';
import errorLogger from '../../../../common/js/utils/errorLogger';

const locator = new Locator({
  url: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer',
});

function createWorldGeocodingSource(sourceIndex = 999) {
  return new SearchSource({
    name: 'World Geocoding Service',
    placeholder: 'Search for places or addresses',

    async getSuggestions(params) {
      try {
        const results = await locator.suggestLocations({
          text: params.suggestTerm,
          location: params.location,
          maxSuggestions: 4,
        });

        return results.map((result) => ({
          key: result,
          text: result.text,
          sourceIndex, // Needed to distinguish source
        }));
      } catch (err) {
        errorLogger.error('Error getting suggestions from geocoder', {
          component: 'createWorldGeocodingSource',
          action: 'getSuggestions',
          error: err,
        });
        return [];
      }
    },

    async getResults(params) {
      store.dispatch(showMapLoader(true));

      try {
        const address = params.suggestResult?.key?.text || params.suggestResult?.text;

        if (!address) {
          errorLogger.warn('No address found in geocoding request', {
            component: 'createWorldGeocodingSource',
            action: 'getResults',
            params,
          });
          return [];
        }

        const locations = await locator.addressToLocations({
          address: { SingleLine: address },
          maxLocations: 1,
        });

        return locations.map((location) => {
          const graphic = new Graphic({
            geometry: location.location,
            symbol: {
              type: 'simple-marker',
              style: 'circle',
              color: [0, 120, 255, 0.4],
              size: 12,
              outline: {
                color: [0, 120, 255, 1],
                width: 2,
              },
            },
            attributes: {
              address: location.address,
            },
            popupTemplate: {
              title: 'Address',
              content: location.address,
            },
          });

          return {
            name: location.address,
            feature: graphic,
          };
        });
      } catch (err) {
        errorLogger.error('Error getting results from geocoder', {
          component: 'createWorldGeocodingSource',
          action: 'getResults',
          error: err,
        });
        return [];
      } finally {
        store.dispatch(showMapLoader(false));
      }
    },
  });
}

export default createWorldGeocodingSource;
