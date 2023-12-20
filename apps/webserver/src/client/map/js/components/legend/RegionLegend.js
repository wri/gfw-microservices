import '../../../css/map.scss';
import React, { Component } from 'react';
import LegendCheckbox from './LegendCheckbox';
import {
  congoPrimaryForestsID,
  cameroonAgroIndustrialZonesID,
  republicOfTheCongoOilPalmConcessionsID,
} from '../../../../common/js/config';
import LegendSection from './LegendSection';

export default class RegionLegend extends Component {
  constructor(props) {
    super(props);
    this.state = {
      countries: [],
      countryGroup: {},
      hiddenCountries: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    const thisLength = this.props.visibleLayers.length;
    const nextLength = nextProps.visibleLayers.length;
    if (nextLength === 0) {
      this.setState({
        countries: [],
      });
    } else if (thisLength !== nextLength) {
      const countries = [];
      nextProps.visibleLayers.forEach((id) => {
        const countryFiltered = this.props.regionLayers.filter((v) => v.id === id);
        if (countryFiltered.length > 0) {
          const country = countryFiltered[0].country;
          countries.push(country);
        }
      });
      this.setState({
        countries: countries,
      });
    }
    const countryGroup = {};
    nextProps.regionLayers.forEach((layer) => {
      if (!countryGroup.hasOwnProperty(layer.country)) {
        countryGroup[layer.country] = [layer];
      } else {
        countryGroup[layer.country].push(layer);
      }
    });
    this.setState({
      countryGroup: countryGroup,
    });
  }

  createLayerLegend = (layer, i) => {
    return (
      <LegendCheckbox
        canopyDensity={this.props.canopyDensity}
        key={i}
        layer={layer}
        visibleLayers={this.props.visibleLayers}
        iconLoading={this.props.iconLoading}
        toggleLayerVisibility={this.props.toggleLayerVisibility}
      />
    );
  };

  showForestAtlas = (country) => {
    return (
      (this.props.visibleLayers.indexOf(congoPrimaryForestsID) !== -1 ||
        this.props.visibleLayers.indexOf(cameroonAgroIndustrialZonesID) !== -1) &&
      (country === 'Democratic Republic of the Congo' || country === 'Cameroon') &&
      this.state.countries.indexOf(country) !== -1
    );
  };

  showForestAtlasCongo = (country) => {
    return (
      this.props.visibleLayers.indexOf(republicOfTheCongoOilPalmConcessionsID) !== -1 &&
      country === 'Republic of the Congo' &&
      this.state.countries.indexOf(country) !== -1
    );
  };

  showWRI = (country) => {
    return country === 'Indonesia' && this.state.countries.indexOf(country) !== -1;
  };

  isVisible = (layers) => {
    let visible = false;
    layers.forEach((layer) => {
      if (this.props.visibleLayers.indexOf(layer.id) > -1) {
        visible = true;
      }
    });
    return visible;
  };

  toggleCountry = (country) => {
    const hiddenCountries = this.state.hiddenCountries.slice();
    const index = hiddenCountries.indexOf(country);
    if (index > -1) {
      hiddenCountries.splice(index, 1);
    } else {
      hiddenCountries.push(country);
    }
    this.setState({ hiddenCountries: hiddenCountries });
  };

  getCountryOptions = () => {
    const { countryGroup } = this.state;
    return Object.keys(countryGroup).map((country, j) => {
      const forestChangeLayers = countryGroup[country].filter(
        (layer) => layer.subGroup === 'forest-change'
      );
      const landCoverLayers = countryGroup[country].filter(
        (layer) => layer.subGroup === 'land-cover'
      );
      const landUseLayers = countryGroup[country].filter((layer) => layer.subGroup === 'land-use');
      const conservationLayers = countryGroup[country].filter(
        (layer) => layer.subGroup === 'conservation'
      );
      const peopleLayers = countryGroup[country].filter((layer) => layer.subGroup === 'people');
      const normalLayers = countryGroup[country].filter((layer) => layer.subGroup === '');

      const visibleForestChange = this.isVisible(forestChangeLayers);
      const visibleLandCover = this.isVisible(landCoverLayers);
      const visibleLandUse = this.isVisible(landUseLayers);
      const visibleConservation = this.isVisible(conservationLayers);
      const visiblePeople = this.isVisible(peopleLayers);
      const visibleNormal = this.isVisible(normalLayers);

      const showForest = this.showForestAtlas(country);
      const showForestCongo = this.showForestAtlasCongo(country);
      const showWRI = this.showWRI(country);
      return (
        <div key={j}>
          <div
            className={`legend-checkbox-country legend-show-panel ${
              this.state.countries.indexOf(country) !== -1 ? '' : 'hidden'
            }`}
            onClick={() => this.toggleCountry(country)}
          >
            {country} data
            <svg className={`${this.state.hiddenCountries.indexOf(country) > -1 ? 'close' : ''}`}>
              <use xlinkHref="#icon-triangle" />
            </svg>
          </div>
          <div className={`${this.state.hiddenCountries.indexOf(country) > -1 ? 'hidden' : ''}`}>
            <p className={`layer-legend-message-country ${showForest ? '' : 'hidden'}`}>
              <a
                href={`http://www.wri.org/applications/maps/forestatlas/${countryGroup[
                  country
                ][0].countryCode.toLowerCase()}/index.htm`}
                target="_blank"
                className="layer-legend-link link-forest-atlas"
              >
                Visit Forest Atlas
                <svg>
                  <use xlinkHref="#icon-navigate" />
                </svg>
              </a>
            </p>
            <p className={`layer-legend-message-country ${showForestCongo ? '' : 'hidden'}`}>
              <a
                href={'http://www.wri.org/tools/atlas/map.php?maptheme=congoforest'}
                target="_blank"
                className="layer-legend-link link-forest-atlas"
              >
                Visit Forest Atlas
                <svg>
                  <use xlinkHref="#icon-navigate" />
                </svg>
              </a>
            </p>
            <p className={`layer-legend-message-country ${showWRI ? '' : 'hidden'}`}>
              <a
                href="http://www.wri.org/our-work/project/forests-and-landscapes-indonesia"
                target="_blank"
                className="layer-legend-link link-forest-atlas"
              >
                WRI in Indonesia
                <svg>
                  <use xlinkHref="#icon-navigate" />
                </svg>
              </a>
            </p>
            <div className={`normal-legend ${visibleNormal ? '' : 'hidden'}`}>
              {normalLayers.map(this.createLayerLegend)}
            </div>
            <LegendSection
              visible={visibleForestChange}
              layers={forestChangeLayers}
              sectionHeader="forest-change"
              text="Forest Change"
              createLayerLegend={this.createLayerLegend}
            />
            <LegendSection
              visible={visibleLandCover}
              layers={landCoverLayers}
              sectionHeader="land-cover"
              text="Land Cover"
              createLayerLegend={this.createLayerLegend}
            />
            <LegendSection
              visible={visibleLandUse}
              layers={landUseLayers}
              sectionHeader="land-use"
              text="Land Use"
              createLayerLegend={this.createLayerLegend}
            />
            <LegendSection
              visible={visibleConservation}
              layers={conservationLayers}
              sectionHeader="conservation"
              text="Conservation"
              createLayerLegend={this.createLayerLegend}
            />
            <LegendSection
              visible={visiblePeople}
              layers={peopleLayers}
              sectionHeader="people"
              text="People"
              createLayerLegend={this.createLayerLegend}
            />
          </div>
        </div>
      );
    });
  };

  render() {
    const { visibleRegion } = this.props;
    const countryGroupOptions = this.getCountryOptions();

    return (
      <div className={`region-legend ${visibleRegion ? '' : 'hidden'}`}>{countryGroupOptions}</div>
    );
  }
}
