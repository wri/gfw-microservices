import { Component } from 'react';
import ModalWrapper from './ModalWrapper';
import { toggleSearch } from '../../actions/mapActions';
import store from '../../store';
import Search from '@arcgis/core/widgets/Search';
import createSearchSource from './createSearchSource';
import createWorldGeocodingSource from './createWorldGeocodingSource';
import { dms2Deg, getAdministrativeAreaName } from './searchUtils';
import './SearchModal.scss';

const tabs = ['Search', 'Coordinates', 'Decimal Degrees'];

const animationOptions = { duration: 300 };

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
    this.searchWidget = new Search({
      view: this.props.mapView,
      container: 'search-widget',
      minSuggestCharacters: 3,
      includeDefaultSources: false,
      sources: [
        createSearchSource(
          'Administrative Areas',
          '/map/gadm-admininstrative-boundaries',
          getAdministrativeAreaName,
          0
        ),
        createSearchSource(
          'Universal Mill List',
          '/map/gfw_universal_mill_list',
          (item) => item.mill_name,
          1
        ),
        createSearchSource(
          'Indigenous or Community land area',
          '/map/landmark_indigenous_and_community_lands',
          (item) => item.name,
          2
        ),
        createSearchSource(
          'Protected Areas',
          '/map/wdpa_licensed_protected_areas',
          (item) => item.name,
          3
        ),

        createWorldGeocodingSource(4),
      ],
    });

    this.searchWidget.on('select-result', (event) => {
      store.dispatch(toggleSearch());

      const geometry = event.result.feature.geometry;

      this.props.mapView.goTo(geometry);

      if (this.props.onProgrammaticMove) {
        this.props.onProgrammaticMove();
      }
    });

    let searchContainer;

    this.searchWidget.on('suggest-start', () => {
      searchContainer = document.querySelector('#search-widget .esri-search__container');

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
