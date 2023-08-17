import ModalWrapper from './ModalWrapper';
import { toggleSearch } from '../../actions/mapActions';
import store from '../../store';
import Search from '@arcgis/core/widgets/Search';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import React, { Component } from 'react';
import { proLayers } from '../../../../common/js/config';

const tabs = ['Search', 'Coordinates', 'Decimal Degrees'];

const animationOptions = { duration: 300 };

// REFERENCE: https://stackoverflow.com/a/5971628
function dms2Deg(s) {
  // Determine if south latitude or west longitude
  var sw = /[sw]/i.test(s);

  // Determine sign based on sw (south or west is -ve)
  var f = sw ? -1 : 1;

  // Get into numeric parts
  var bits = s.match(/[\d.]+/g) || [];

  var result = 0;

  // Convert to decimal degrees
  for (var i = 0, iLen = bits.length; i < iLen; i++) {
    // String conversion to number is done by division
    // To be explicit (not necessary), use
    //   result += Number(bits[i])/f
    result += bits[i] / f;

    // Divide degrees by +/- 1, min by +/- 60, sec by +/-3600
    f *= 60;
  }

  return result;
}

export default class SearchModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleTab: 0,
    };
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.loaded && this.props.loaded) {
      this.createSearch();
    }
  }

  createSearch = () => {
    const { mapLayers } = this.props;
    const universalMillListURL = mapLayers.filter(
      (layer) => layer.id === proLayers.universalMillList
    )[0].layerConfig.body.url;
    const oilPalmConcessionsURL = mapLayers.filter(
      (layer) => layer.id === proLayers.oilPalmConcessions
    )[0].layerConfig.body.url;
    const rspoConcessionsURL = mapLayers.filter(
      (layer) => layer.id === proLayers.rspoConcessions
    )[0].layerConfig.body.url;
    // const rspoPalmOilMillsURL = mapLayers.filter(layer => layer.id === rspoPalmOilMills)[0].layerConfig.body.url;
    const protectedAreasURL = mapLayers.filter((layer) => layer.id === proLayers.protectedAreas)[0]
      .layerConfig.body.url;
    const landRightsURL = mapLayers.filter((layer) => layer.id === proLayers.landRights)[0]
      .layerConfig.body.url;

    this.searchWidget = new Search({
      view: this.props.mapView,
      container: 'search-widget',
      minSuggestCharacters: 3,
      sources: [
        {
          url: 'https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer',
          singleLineFieldName: 'SingleLine',
          outFields: ['Addr_type'],
          maxSuggestions: 3,
          name: 'Address Search',
          localSearchOptions: {
            minScale: 300000,
            distance: 50000,
          },
          placeholder: 'Find address or place',
        },
        {
          featureLayer: new FeatureLayer({
            url: 'https://gfwpro-gis.globalforestwatch.org/arcgis/rest/services/admin/MapServer/6',
            popupTemplate: {
              title: 'Country: {name_0}',
            },
            id: `${proLayers.administrativeAreas}-country`,
          }),
          searchFields: ['name_0'],
          suggestionTemplate: 'Country: {name_0}',
          outFields: ['name_0'],
          name: 'Administrative Areas: Countries',
          placeholder: 'Search country',
          maxSuggestions: 4,
        },
        {
          featureLayer: new FeatureLayer({
            url: 'https://gfwpro-gis.globalforestwatch.org/arcgis/rest/services/admin/MapServer/5',
            popupTemplate: {
              title: 'State: {name_1}',
              content: [
                {
                  type: 'fields',
                  fieldInfos: [
                    {
                      fieldName: 'name_0',
                      label: 'Country',
                      visible: true,
                    },
                  ],
                },
              ],
            },
            id: `${proLayers.administrativeAreas}-state`,
          }),
          searchFields: ['name_1'],
          suggestionTemplate: 'Country: {name_0}, State: {name_1}',
          outFields: ['name_0', 'name_1'],
          name: 'Administrative Areas: States',
          placeholder: 'Search state',
          maxSuggestions: 4,
        },
        {
          featureLayer: new FeatureLayer({
            url: 'https://gfwpro-gis.globalforestwatch.org/arcgis/rest/services/admin/MapServer/4',
            popupTemplate: {
              title: 'Sub-State: {name_2}',
              content: [
                {
                  type: 'fields',
                  fieldInfos: [
                    {
                      fieldName: 'name_0',
                      label: 'Country',
                      visible: true,
                    },
                    {
                      fieldName: 'name_1',
                      label: 'State',
                      visible: true,
                    },
                  ],
                },
              ],
            },
            id: `${proLayers.administrativeAreas}-sub-state`,
          }),
          searchFields: ['name_2'],
          suggestionTemplate: 'Country: {name_0}, State: {name_1}, Sub-State: {name_2}',
          outFields: ['name_0', 'name_1', 'name_2'],
          name: 'Administrative Areas: Sub-states',
          placeholder: 'Search sub-state',
          maxSuggestions: 4,
        },
        {
          featureLayer: new FeatureLayer({
            url: universalMillListURL,
            id: `${proLayers.universalMillList}_feat`,
          }),
          searchFields: ['Mill_Name', 'Prnt_Comp', 'ID'],
          suggestionTemplate:
            'Mill Name: {Mill_Name}, Parent Company: {Prnt_Comp}, Universal Mill Id: {ID}',
          outFields: ['Mill_Name', 'Prnt_Comp', 'ID', 'globalid'],
          name: 'Universal Mill List',
          placeholder: 'Search Universal Mill Lists',
        },
        {
          featureLayer: new FeatureLayer({
            url: oilPalmConcessionsURL,
            id: `${proLayers.oilPalmConcessions}_feat`,
          }),
          searchFields: ['name', 'company', 'group_comp', 'subgroup'],
          suggestionTemplate:
            'Mill Name: {name}, Company: {company}, Group: {group_comp}, Subgroup: {subgroup}',
          outFields: ['name', 'company', 'group_comp', 'subgroup', 'globalid'],
          name: 'Oil Palm Concessions',
          placeholder: 'Search Oil Palm Concessions',
        },
        {
          featureLayer: new FeatureLayer({
            url: rspoConcessionsURL,
            id: `${proLayers.rspoConcessions}_feat`,
          }),
          searchFields: ['name', 'group_arch', 'group_comp', 'subgroup'],
          suggestionTemplate:
            'Mill Name: {name}, Company: {group_arch}, Group: {group_comp}, Subgroup: {subgroup}',
          outFields: ['name', 'group_arch', 'group_comp', 'subgroup', 'globalid'],
          name: 'RSPO Concessions',
          placeholder: 'Search RSPO Concessions',
          // }, {
          //   featureLayer: new FeatureLayer({
          //     url: rspoPalmOilMillsURL
          //   }),
          //   searchFields: ['mill_name_', 'company_na', 'group_name'],
          //   suggestionTemplate: 'Mill Name: {mill_name_}, Company: {company_na}, Group: {group_name}',
          //   outFields: ['mill_name_', 'company_na', 'group_name'],
          //   name: 'RSPO Palm Oil Mills',
          //   placeholder: 'Search RSPO Palm Oil Mills'
        },
        {
          featureLayer: new FeatureLayer({
            url: protectedAreasURL,
            id: `${proLayers.protectedAreas}_feat`,
          }),
          searchFields: ['name', 'orig_name'],
          suggestionTemplate: 'Name: {name}, Original Name: {orig_name}',
          outFields: ['name', 'orig_name', 'globalid'],
          name: 'Protected Areas',
          placeholder: 'Search Protected Areas',
        },
        {
          featureLayer: new FeatureLayer({
            url: landRightsURL,
          }),
          searchFields: ['name'],
          suggestionTemplate: 'Name: {name}',
          outFields: ['name'],
          name: 'Land Rights',
          placeholder: 'Search Land Rights',
        },
      ],
    });

    this.searchWidget.on('select-result', () => {
      store.dispatch(toggleSearch());
    });

    const searchContainer = document.querySelector('#search-widget .esri-search__container');
    this.searchWidget.on('suggest-start', () => {
      searchContainer.classList.add('esri-search--loading');
    });
    this.searchWidget.on('suggest-complete', () => {
      searchContainer.classList.remove('esri-search--loading');
    });
  };

  close = () => {
    store.dispatch(toggleSearch());
  };

  decimalDegreeSearch = () => {
    const values = [this.refs.decimalDegreeLat.value, this.refs.decimalDegreeLng.value].map(
      parseFloat
    );
    const [lat, lng] = values;
    if (values.map(isNaN).indexOf(true) > -1) {
      throw Error('Invalid input(s)');
    }
    this.props.mapView.goTo(
      {
        center: [lng, lat],
        zoom: 12,
      },
      animationOptions
    );
    this.close();
  };

  utmSearch = () => {
    const values = [this.refs.eastDeg.value, this.refs.northDeg.value, this.refs.zoneDeg.value].map(
      parseFloat
    );
    const directionC = this.refs.directionC.value;
    console.log(values);
    console.log(directionC);
    // const [lat, lng] = values;
    // if (values.map(isNaN).indexOf(true) > -1) { throw Error('Invalid input(s)'); }
    // this.props.mapView.goTo({
    //   center: [lat, lng],
    //   zoom: 12
    // }, animationOptions);
  };

  coordinateSearch = () => {
    const dmsA = Array.apply({}, this.refs.coordinatesA.querySelectorAll('input'))
      .map((i) => i.value)
      .map((v) => parseInt(v))
      .map(Math.abs);
    const directionA = this.refs.directionA.value;
    const dmsB = Array.apply({}, this.refs.coordinatesB.querySelectorAll('input'))
      .map((i) => i.value)
      .map((v) => parseInt(v))
      .map(Math.abs);
    const directionB = this.refs.directionB.value;
    const lat = dms2Deg(`${directionA} ${dmsA[0]} ${dmsA[1]}' ${dmsA[2]}"`);
    const lng = dms2Deg(`${directionB} ${dmsB[0]} ${dmsB[1]}' ${dmsB[2]}"`);
    this.props.mapView.goTo(
      {
        center: [lng, lat],
        zoom: 12,
      },
      animationOptions
    );
    this.close();
  };

  render() {
    const { info } = this.props;
    const theme = info && info.download_data ? '' : 'no-download search-tool-wrapper';

    return (
      <ModalWrapper onClose={this.close} theme={theme}>
        <div
          className={`search-tools map-component ${
            this.state.visibleTab === 1 ? 'search-tools-coords' : ''
          }`}
        >
          <div className="search-tab-container">
            {tabs.map((t, i) => (
              <button
                key={i}
                className={`search-tab ${i === this.state.visibleTab ? 'active' : ''}`}
                onClick={() => this.setState({ visibleTab: i })}
              >
                {t}
              </button>
            ))}
          </div>
          <div className={`search-input-container ${this.state.visibleTab === 0 ? '' : 'hidden'}`}>
            <div id="search-widget"></div>
          </div>
          <div
            className={this.state.visibleTab === 1 ? 'coordinate-search-tab-container' : 'hidden'}
          >
            <div ref="coordinatesA" className="search-coordinates back-white">
              <div>
                <input className="search-input" type="number" min="0" step="1" placeholder="00" />
                <span className="search-tool-inner-symbols">º</span>
              </div>
              <div>
                <input className="search-input" type="number" min="0" step="1" placeholder="00" />
                <span className="search-tool-inner-symbols">{"'"}</span>
              </div>
              <div>
                <input className="search-input" type="number" min="0" step="1" placeholder="00" />
                <span className="search-tool-inner-symbols">{'"'}</span>
              </div>
              <select ref="directionA">
                <option>N</option>
                <option>S</option>
              </select>
            </div>
            <div ref="coordinatesB" className="search-coordinates back-white">
              <div>
                <input className="search-input" type="number" min="0" step="1" placeholder="00" />
                <span className="search-tool-inner-symbols">º</span>
              </div>
              <div>
                <input className="search-input" type="number" min="0" step="1" placeholder="00" />
                <span className="search-tool-inner-symbols">{"'"}</span>
              </div>
              <div>
                <input className="search-input" type="number" min="0" step="1" placeholder="00" />
                <span className="search-tool-inner-symbols">{'"'}</span>
              </div>
              <select ref="directionB">
                <option>W</option>
                <option>E</option>
              </select>
            </div>
            <div id="coordinateSearch">
              <button
                className="search-submit-button gfw-btn green"
                onClick={this.coordinateSearch}
              >
                Search
              </button>
            </div>
          </div>
          <div className={`search-box degrees ${this.state.visibleTab === 2 ? '' : 'hidden'}`}>
            <div className="deg-box">
              <span>Lat:</span>
              <input
                ref="decimalDegreeLat"
                type="number"
                className="deg-input"
                id="deg-lat"
                name="deg-lat"
              />
            </div>
            <div className="deg-box">
              <span>Lon:</span>
              <input
                ref="decimalDegreeLng"
                type="number"
                className="deg-input"
                id="deg-lng"
                name="deg-lng"
              />
            </div>
            <button
              className="search-submit-button gfw-btn green"
              onClick={this.decimalDegreeSearch}
            >
              Search
            </button>
          </div>
        </div>
      </ModalWrapper>
    );
  }
}
