import React, { Component } from 'react';
import Highcharts from 'highcharts';

import { formatNum, formatPct, prettifyNum, validatePct } from '../../utils/diagnostics.utils';
import { locationsPage, mapPage, latestTreeCoverLossYearFC } from '../../../../common/js/config';
import IconButtonWrapper from '../IconButtonWrapper';
import '../../../css/locations.scss';

import '../../../../common/css/_irsBase.scss';
import '../../../../common/css/_irsStyle.scss';

let isMounted = false;

export default class SoutheastAsiaRegions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSlider: false,
      startYear: 2001,
      endYear: latestTreeCoverLossYearFC,
      tclChecked: true,
      seaChecked: false,
      idnChecked: false,
      idnLegalChecked: false,
      idnMoratoriumChecked: false,
      idnPrimaryForestChecked: false,
    };
  }

  componentDidMount() {
    isMounted = true;

    if ($('#southeast-asia-slider').ionRangeSlider) {
      $('#southeast-asia-slider').ionRangeSlider({
        type: 'double',
        values: mapPage.treeCoverLossYearsFC,
        hide_min_max: true,
        from_min: 0,
        from_max: latestTreeCoverLossYearFC - 2001,
        grid: true,
        grid_snap: true,
        from: 0,
        to: latestTreeCoverLossYearFC - 2001,
        onChange: this.setSliderActive,
        onFinish: this.setSliderRange,
        prettify: (value) => value,
      });
    }
    const { view } = this.props;
    if (view === 'diagnostics') {
      this.renderBarChart(this.refs.southeastAsiaChart);
      this.renderPieChart(this.refs.southEastAsiaPie);
    }
  }

  componentWillUnmount() {
    isMounted = false;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.view === 'diagnostics' && this.props.view !== 'diagnostics' && isMounted) {
      this.setState(
        {
          startYear: 2001,
          endYear: latestTreeCoverLossYearFC,
          tclChecked: true,
          seaChecked: false,
          idnChecked: false,
          idnLegalChecked: false,
          idnMoratoriumChecked: false,
          idnPrimaryForestChecked: false,
        },
        () => {
          const slider = $('#southeast-asia-slider').data('ionRangeSlider');
          slider.update({
            from: 0,
            to: latestTreeCoverLossYearFC - 2001,
          });
        }
      );
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { view } = this.props;
    const {
      startYear,
      endYear,
      tclChecked,
      seaChecked,
      idnChecked,
      idnLegalChecked,
      idnMoratoriumChecked,
      idnPrimaryForestChecked,
    } = this.state;
    if (
      (prevProps.view !== 'diagnostics' && view === 'diagnostics') ||
      prevState.startYear !== startYear ||
      prevState.endYear !== endYear ||
      prevState.tclChecked !== tclChecked ||
      prevState.seaChecked !== seaChecked ||
      prevState.idnChecked !== idnChecked ||
      prevState.idnLegalChecked !== idnLegalChecked ||
      prevState.idnMoratoriumChecked !== idnMoratoriumChecked ||
      prevState.idnPrimaryForestChecked !== idnPrimaryForestChecked
    ) {
      this.renderPieChart(this.refs.southEastAsiaPie);
    }

    if (
      !tclChecked &&
      !seaChecked &&
      !idnChecked &&
      !idnLegalChecked &&
      !idnMoratoriumChecked &&
      !idnPrimaryForestChecked &&
      isMounted
    ) {
      this.setState({ tclChecked: true });
    }
  }

  withCommas = (num) => {
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  getRegionCountLabel = () => {
    const { diagnosticView, filteredData, getFilteredLocations } = this.props;
    const filteredLocations = getFilteredLocations();
    const numerator =
      diagnosticView === 'LIST'
        ? filteredData.filter((l) => l.southeast_asia_presence).length
        : filteredLocations.filter((l) => l.southeast_asia_presence === 'true').length;
    const numeratorWithCommas = this.withCommas(numerator);
    const filteredDataWithCommas = this.withCommas(filteredData.length);
    return {
      count: numerator,
      label: `Showing data for ${numeratorWithCommas} out of ${
        diagnosticView === 'LIST' ? filteredDataWithCommas : '1'
      } locations`,
    };
  };

  render() {
    const { listView } = this.props;

    const { activeSlider, seaChecked, idnChecked, idnLegalChecked, idnMoratoriumChecked } =
      this.state;

    let pieLabel = '';
    if (seaChecked) {
      pieLabel = 'Southeast Asia Landcover Percent Overlap';
    } else if (idnChecked) {
      pieLabel = 'Indonesia Landcover Percent Overlap';
    } else if (idnLegalChecked) {
      pieLabel = 'Indonesia Legal Classification Percent Overlap';
    } else if (idnMoratoriumChecked) {
      pieLabel = 'Indonesia Forest Moratorium Percent Overlap';
    }

    // Get yearly totals
    const yearlyTotals = this.getYearlyTotalData();
    // Render the table
    const yearlyTotalsTable = this.renderTotalsTable(yearlyTotals);
    // Get locations selected
    const regionObject = this.getRegionCountLabel();
    // Check to show pie chart
    const displaySEPie = this.displayPie();

    return (
      <div
        className={`locations-diagnostics-section ${
          regionObject.count && listView === 'forest_change' ? '' : 'hidden'
        }`}
      >
        {/* HEADER FOR PANEL */}
        <div className="locations-diagnostics-section-title">Southeast Asia</div>

        {/* TREE COVER LOSS GRAPH */}
        <div className="locations-diagnostics__subsection section__southeast-asia">
          <div className="subsection-chart">
            <div className="locations-diagnostics__subsection-container">
              <div className="locations-diagnostics__flex-center subsection-subtitle__container">
                <span className="subsection-subtitle">TREE COVER LOSS</span>
                <IconButtonWrapper id={locationsPage.infoBubbleConfig.regionsSeaAnnual} />
                <span
                  onClick={() => this.props.fireDownload('southEastAsiaTCL')}
                  className="locations-diagnostics-icon-holder"
                >
                  <svg className="svg-icon">
                    <use xlinkHref="#icon-download" />
                  </svg>
                </span>
              </div>
              <div className="locations-diagnostics-chart__locations-text">
                {regionObject.label}
              </div>
            </div>

            <p className="locations-instructional__text">
              Select one main category and/or sub-category.
            </p>
            <div className="chart-container">
              <div ref="southeastAsiaChart" />
            </div>
          </div>
          <div className="locations-diagnostics-table">
            <table>
              <thead>
                <tr>
                  <th />
                  <th className="label right">TOTAL LOSS (ha)</th>
                </tr>
              </thead>
              <tbody>{yearlyTotalsTable}</tbody>
            </table>
          </div>
        </div>

        {/* SUB-SUB PANEL FOR PIE CHART/TABLE */}
        <div
          className={`locations-diagnostics__subsection section__southeast-asia-landcover-percent-overlap locations-diagnostics-table--pie print-no-break ${
            displaySEPie ? '' : 'hidden'
          }`}
        >
          <div className="subsection-chart">
            <div className="locations-diagnostics__flex-center subsection-subtitle__container">
              <h3 className="subsection-subtitle">{pieLabel}</h3>
              {seaChecked && (
                <IconButtonWrapper id={locationsPage.infoBubbleConfig.regionsSeaLcCalc} />
              )}
              {idnChecked && (
                <IconButtonWrapper id={locationsPage.infoBubbleConfig.regionsIdnLcCalc} />
              )}
              {idnLegalChecked && (
                <IconButtonWrapper id={locationsPage.infoBubbleConfig.regionsIdnLegal} />
              )}
              {idnMoratoriumChecked && (
                <IconButtonWrapper id={locationsPage.infoBubbleConfig.regionsIdnForestM} />
              )}
              <span
                onClick={() => this.props.fireDownload('southEastAsiaOverlap')}
                className="locations-diagnostics-icon-holder"
              >
                <svg className="svg-icon">
                  <use xlinkHref="#icon-download" />
                </svg>
              </span>
            </div>
            <div className="chart-container">
              <div ref="southEastAsiaPie" />
            </div>
          </div>
          <div className="locations-diagnostics-table">
            <table>
              <thead>
                <tr>
                  <th className="label">Category</th>
                  <th className="label right">
                    <span>Percent (%) Overlap</span>
                  </th>
                </tr>
              </thead>
              <tbody>{this.renderSoutheastAsiaTable()}</tbody>
            </table>
          </div>
        </div>

        {/* YEAR SLIDER */}
        <div className="locations-diagnostics-subsection">
          <div
            className={`southeast-asia-slider__container slider__container ${
              activeSlider ? 'slider-active' : ''
            }`}
          >
            <input id="southeast-asia-slider" />
          </div>
        </div>
      </div>
    );
  }

  displayPie = () => {
    const { seaChecked, idnChecked, idnLegalChecked, idnMoratoriumChecked } = this.state;
    return !!(seaChecked || idnChecked || idnLegalChecked || idnMoratoriumChecked);
  };

  renderPieChart = (ref) => {
    const { getFilteredLocations, assignHighchartColor } = this.props;
    const filteredLocations = getFilteredLocations();
    const { seaChecked, idnChecked, idnLegalChecked, idnMoratoriumChecked } = this.state;

    let filterPropertyLocations = [];
    let overlapCategoryNames;

    const series = [
      {
        name: '',
        data: [],
      },
    ];

    if (seaChecked) {
      filterPropertyLocations = filteredLocations.map((location) =>
        JSON.parse(location.sea_landcover_area)
      );
    }
    if (idnChecked) {
      filterPropertyLocations = filteredLocations.map((location) =>
        JSON.parse(location.idn_landcover_area)
      );
    }
    if (idnLegalChecked) {
      filterPropertyLocations = filteredLocations.map((location) =>
        JSON.parse(location.idn_legal_area)
      );
    }
    if (idnMoratoriumChecked) {
      filterPropertyLocations = filteredLocations.map((location) =>
        JSON.parse(location.idn_forest_moratorium_area)
      );
    }

    if (filterPropertyLocations.length > 0) {
      overlapCategoryNames = Object.entries(filterPropertyLocations[0]).map(
        (category) => category[0]
      );
    }

    this.renderBarChart(this.refs.southeastAsiaChart, overlapCategoryNames);

    let serie = [];
    const result = {};

    if (idnMoratoriumChecked) {
      const totalInArea = filterPropertyLocations.reduce((a, c) => a + c, 0);
      const totalArea = filteredLocations
        .map((l) => JSON.parse(l.total_area))
        .reduce((a, c) => a + c, 0);
      result['Within Forest Moratorium'] = (totalInArea / totalArea) * 100;
      result['Outside Forest Moratorium'] = ((totalArea - totalInArea) / totalArea) * 100;
      serie = Object.entries(result).map((category) => {
        const [name, value] = category;
        const color = name === 'Within Forest Moratorium' ? '#555555' : '#E5E5DF';
        return {
          name,
          color,
          y: value,
        };
      });
    } else {
      filterPropertyLocations.forEach((location) => {
        Object.entries(location).forEach((pair) => {
          const [category, value] = pair;
          if (result.hasOwnProperty(category)) {
            result[category] += value;
          } else {
            result[category] = value;
          }
        });
      });

      let total = 0;
      filterPropertyLocations.forEach((location) => {
        total += Object.values(location).reduce((preValue, currValue) => preValue + currValue, 0);
      });

      serie = Object.entries(result).map((biome) => {
        const [name, value] = biome;
        return {
          name,
          color: assignHighchartColor(name),
          y: (value / total) * 100,
        };
      });
    }

    series[0].data = serie;

    const chart = new Highcharts.chart({
      chart: {
        renderTo: ref,
        type: 'pie',
      },
      title: {
        text: '',
      },
      tooltip: {
        headerFormat: '<table style="background-color:#fff;border: 4px solid #fff">',
        pointFormatter: function () {
          return (
            `<tr>` +
            `<td style="padding:0;">${this.name}:</td>` +
            `<td style="padding:0"><b style="padding-left:0.25rem">${formatPct(this.y)}%</b></td>` +
            `</tr>`
          );
        },
        footerFormat: '</table>',
        shared: true,
        padding: 0,
        useHTML: true,
        borderWidth: 2,
        borderColor: '#ccc',
        backgroundColor: '#fff',
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            useHTML: true,
            enabled: true,
            formatter: function () {
              return `<b>${this.point.name}: </b>${formatPct(this.percentage)}%`;
            },
            style: {
              color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black',
            },
          },
        },
      },
      series: series,
      credits: {
        enabled: false,
      },
    });
    return chart;
  };

  renderBarChart = (ref, overlapCategoryNames) => {
    const { getYearlyData, getYearlyHighchartSeries, getCategoricalHighchartSeries } = this.props;
    const {
      startYear,
      endYear,
      tclChecked,
      seaChecked,
      idnChecked,
      idnLegalChecked,
      idnMoratoriumChecked,
      idnPrimaryForestChecked,
    } = this.state;
    const series = [];

    if (tclChecked) {
      series.push({
        name: 'Tree Cover Loss Total',
        data: getYearlyHighchartSeries(
          getYearlyData('tree_cover_loss_total_yearly', startYear, endYear)
        ),
        color: '#ef669a',
        groupPadding: 0,
        showInLegend: false,
      });
    }
    if (seaChecked) {
      const seaSeries = getCategoricalHighchartSeries(
        'tree_cover_loss_sea_landcover_yearly',
        startYear,
        endYear
      );
      series.push(...seaSeries);
    }
    if (idnChecked) {
      const idnSeries = getCategoricalHighchartSeries(
        'tree_cover_loss_idn_landcover_yearly',
        startYear,
        endYear
      );
      series.push(...idnSeries);
    }
    if (idnLegalChecked) {
      const idnLegalSeries = getCategoricalHighchartSeries(
        'tree_cover_loss_idn_legal_yearly',
        startYear,
        endYear
      );
      series.push(...idnLegalSeries);
    }
    if (idnMoratoriumChecked) {
      series.push({
        name: 'Indonesia Moratorium',
        stack: 'Indonesia Moratorium',
        data: getYearlyHighchartSeries(
          getYearlyData('tree_cover_loss_idn_forest_moratorium_yearly', startYear, endYear)
        ),
        color: '#686868',
        groupPadding: 0,
        showInLegend: false,
      });
    }
    if (idnPrimaryForestChecked) {
      series.push({
        name: 'Primary Forest',
        stack: 'Indonesia Primary Forest',
        data: getYearlyHighchartSeries(
          getYearlyData('tree_cover_loss_idn_primary_forest_yearly', startYear, endYear)
        ),
        color: '#686868',
        groupPadding: 0,
        showInLegend: false,
      });
    }

    let filteredSeries;
    if (overlapCategoryNames) {
      filteredSeries = series.filter((serie) => overlapCategoryNames.includes(serie.name));
      if (tclChecked) {
        filteredSeries.push({
          name: 'Tree Cover Loss Total',
          data: getYearlyHighchartSeries(
            getYearlyData('tree_cover_loss_total_yearly', startYear, endYear)
          ),
          color: '#ef669a',
          groupPadding: 0,
          showInLegend: false,
        });
      }
      if (idnMoratoriumChecked) {
        filteredSeries.push({
          name: 'Indonesia Moratorium',
          stack: 'Indonesia Moratorium',
          data: getYearlyHighchartSeries(
            getYearlyData('tree_cover_loss_idn_forest_moratorium_yearly', startYear, endYear)
          ),
          color: '#686868',
          groupPadding: 0,
          showInLegend: false,
        });
      }
      if (idnPrimaryForestChecked) {
        filteredSeries.push({
          name: 'Primary Forest',
          stack: 'Indonesia Primary Forest',
          data: getYearlyHighchartSeries(
            getYearlyData('tree_cover_loss_idn_primary_forest_yearly', startYear, endYear)
          ),
          color: '#686868',
          groupPadding: 0,
          showInLegend: false,
        });
      }
    }
    const chartSeries = filteredSeries ? filteredSeries : series;

    const chart = new Highcharts.chart({
      chart: {
        renderTo: ref,
        type: 'column',
      },
      title: {
        text: '',
      },
      xAxis: {
        type: 'category',
        crosshair: true,
        title: {
          useHTML: true,
          text: '<div class="SoutheastAsiaRegions__hc-xAxis--title">Years</div>',
        },
        labels: {
          formatter: function () {
            return `'${this.value.slice(-2)}`;
          },
        },
      },
      yAxis: {
        min: 0,
        title: {
          useHTML: true,
          text: '<div class="SoutheastAsiaRegions__hc-yAxis--title">ha</div>',
        },
      },
      tooltip: {
        headerFormat: '<table>',
        pointFormatter: function () {
          return `<tr><td style="color:${this.color};padding:0">${
            this.series.name
          }: </td><td style="padding-top:0; padding-bottom: 0"><b>${prettifyNum(
            formatNum(this.y || '0')
          )} ha</b></td></tr>`;
        },
        footerFormat: '</table><span style="font-size:10px">in {point.key}</span>',
        shared: true,
        useHTML: true,
      },
      plotOptions: {
        series: {
          stacking: 'normal',
        },
        column: {
          stacking: 'normal',
          pointPadding: 0.2,
          borderWidth: 0,
        },
      },
      series: chartSeries,
      credits: {
        enabled: false,
      },
    });

    return chart;
  };

  renderSoutheastAsiaTable = () => {
    const { getFilteredLocations, assignHighchartColor } = this.props;
    const filteredLocations = getFilteredLocations();
    const { seaChecked, idnChecked, idnLegalChecked, idnMoratoriumChecked } = this.state;

    let filterPropertyLocations = [];

    if (seaChecked) {
      filterPropertyLocations = filteredLocations.map((location) =>
        JSON.parse(location.sea_landcover_area)
      );
    }
    if (idnChecked) {
      filterPropertyLocations = filteredLocations.map((location) =>
        JSON.parse(location.idn_landcover_area)
      );
    }
    if (idnLegalChecked) {
      filterPropertyLocations = filteredLocations.map((location) =>
        JSON.parse(location.idn_legal_area)
      );
    }
    if (idnMoratoriumChecked) {
      filterPropertyLocations = filteredLocations.map((location) =>
        JSON.parse(location.idn_forest_moratorium_area)
      );
    }

    const result = {};

    if (idnMoratoriumChecked) {
      const totalInArea = filterPropertyLocations.reduce((a, c) => a + c, 0);
      const totalArea = filteredLocations
        .map((l) => JSON.parse(l.total_area))
        .reduce((a, c) => a + c, 0);
      result['Within Forest Moratorium'] = formatPct(validatePct((totalInArea / totalArea) * 100));
      result['Outside Forest Moratorium'] = formatPct(
        validatePct((totalArea - totalInArea) / totalArea) * 100
      );
      return Object.entries(result).map((category) => {
        const [categoryName, value] = category;
        const color = categoryName === 'Within Forest Moratorium' ? '#555555' : '#E5E5DF';
        return (
          <tr key={categoryName} className={'locations-diagnostics-table__row child'}>
            <td className="locations-diagnostics-table__column legend">
              <div className="landcover-table-cell__container">
                <div className="landcover-table-cell__color" style={{ backgroundColor: color }} />
                <span>{categoryName}</span>
              </div>
            </td>
            <td className="right">{`${value}%`}</td>
          </tr>
        );
      });
    } else {
      filterPropertyLocations.forEach((location) => {
        Object.entries(location).forEach((pair) => {
          const [category, value] = pair;
          if (result.hasOwnProperty(category)) {
            result[category] += value;
          } else {
            result[category] = value;
          }
        });
      });

      let total = 0;
      filterPropertyLocations.forEach((location) => {
        total += Object.values(location).reduce((preValue, currValue) => preValue + currValue, 0);
      });

      return Object.entries(result).map((category) => {
        const [categoryName, value] = category;
        const color = assignHighchartColor(categoryName);
        if (formatPct(validatePct((value / total) * 100)) !== '0.00') {
          return (
            <tr key={categoryName} className={'locations-diagnostics-table__row child'}>
              <td className="locations-diagnostics-table__column legend">
                <div className="landcover-table-cell__container">
                  <div className="landcover-table-cell__color" style={{ backgroundColor: color }} />
                  <span>{categoryName}</span>
                </div>
              </td>
              <td className="right">{`${formatPct(validatePct((value / total) * 100))}%`}</td>
            </tr>
          );
        } else {
          return null;
        }
      });
    }
  };

  renderTotalsTable = (yearlyTotals) => {
    const { getFilteredLocations } = this.props;
    const {
      tclChecked,
      seaChecked,
      idnChecked,
      idnLegalChecked,
      idnMoratoriumChecked,
      idnPrimaryForestChecked,
    } = this.state;

    let checked;
    let onChange;
    let label;
    let legendColor;
    let indent;
    let disabled = false;

    const filteredLocations = getFilteredLocations();
    const indonesiaPresence = filteredLocations.some(
      (location) => location.indonesia_presence === 'true'
    );
    const seaPresence = filteredLocations.some(
      (location) => location.southeast_asia_presence === 'true'
    );

    const yearlyTotalsTable = Object.entries(yearlyTotals).map((entry) => {
      const [key, value] = entry;

      switch (key) {
        case 'totalTCL':
          label = 'Tree Cover Loss';
          legendColor = 'rgb(255,127,179)';
          checked = tclChecked;
          onChange = () => {
            this.setState({
              tclChecked: !tclChecked,
            });
            gtag('event', 'Southeast Asia checkbox clicked', {
              ''event_category'': 'Forest Change Diagnostics Click',
              ''event_label'': 'user checked tree cover loss',
            });
          };
          indent = false;
          disabled = false;
          break;
        case 'sea':
          label = 'Southeast Asia Landcover';
          legendColor = undefined;
          checked = seaChecked;
          onChange = () => {
            this.setState({
              idnChecked: false,
              idnLegalChecked: false,
              idnMoratoriumChecked: false,
              idnPrimaryForestChecked: false,
              seaChecked: !this.state.seaChecked,
            });
            gtag('event', 'Southeast Asia checkbox clicked', {
              ''event_category'': 'Forest Change Diagnostics Click',
              ''event_label'': 'user checked southeast asia landcover'
            });
          };
          disabled = seaPresence ? false : true;
          indent = true;
          break;
        case 'idnTCL':
          label = 'Indonesia Landcover';
          legendColor = undefined;
          checked = idnChecked;
          onChange = () => {
            this.setState({
              seaChecked: false,
              idnLegalChecked: false,
              idnMoratoriumChecked: false,
              idnPrimaryForestChecked: false,
              idnChecked: !this.state.idnChecked,
            });
            gtag('event', 'Southeast Asia checkbox clicked', {
              ''event_category'': 'Forest Change Diagnostics Click',
              ''event_label'': 'user checked indonesia landcover',
            });
          };
          indent = true;
          disabled = indonesiaPresence ? false : true;
          break;
        case 'idnLegalTCL':
          label = 'Indonesia Legal Classification';
          legendColor = undefined;
          checked = idnLegalChecked;
          onChange = () => {
            this.setState({
              seaChecked: false,
              idnChecked: false,
              idnMoratoriumChecked: false,
              idnPrimaryForestChecked: false,
              idnLegalChecked: !this.state.idnLegalChecked,
            });
            gtag('event', 'Southeast Asia checkbox clicked', {
              ''event_category'': 'Forest Change Diagnostics Click',
              ''event_label'': 'user checked indonesia legal classification',
            });
          };
          indent = true;
          disabled = indonesiaPresence ? false : true;
          break;
        case 'idnMoratoriumTCL':
          label = 'Indonesia Forest Moratorium';
          legendColor = 'rgb(129,129,129)';
          checked = idnMoratoriumChecked;
          onChange = () => {
            this.setState({
              seaChecked: false,
              idnChecked: false,
              idnLegalChecked: false,
              idnPrimaryForestChecked: false,
              idnMoratoriumChecked: !this.state.idnMoratoriumChecked,
            });
            gtag('event', 'Southeast Asia checkbox clicked', {
              ''event_category'': 'Forest Change Diagnostics Click',
              ''event_label'': 'user checked indonesia forest moratorium',
            });
          };
          indent = true;
          disabled = indonesiaPresence ? false : true;
          break;
        case 'idnPrimaryForestTCL':
          label = 'Primary Forest';
          legendColor = 'rgb(129,129,129)';
          checked = idnPrimaryForestChecked;
          onChange = () => {
            this.setState({
              seaChecked: false,
              idnChecked: false,
              idnLegalChecked: false,
              idnMoratoriumChecked: false,
              idnPrimaryForestChecked: !this.state.idnPrimaryForestChecked,
            });
            gtag('event', 'Southeast Asia checkbox clicked', {
              ''event_category'': 'Forest Change Diagnostics Click',
              ''event_label'': 'user checked indonesia primary forest',
            });
          };
          indent = true;
          disabled = indonesiaPresence ? false : true;
          break;
      }

      return (
        <tr
          key={`asia-${key}`}
          className={`locations-diagnostics-table__row ${key === 'totalTCL' ? 'parent' : 'child'}`}
        >
          <th className={`locations-diagnostics-table__column ${indent ? 'indent' : ''}`}>
            <input
              type="checkbox"
              id={`asia-${key}-check`}
              className={key === 'totalTCL' ? 'pink' : 'grey'}
              checked={checked}
              onChange={onChange}
              disabled={disabled}
            />
            <label
              htmlFor={`asia-${key}-check`}
              className={`legend-square-label ${disabled ? 'peat-disabled' : ''}`}
            >
              {label}
            </label>
          </th>
          <th className="right">{prettifyNum(formatNum(value))}</th>
        </tr>
      );
    });
    return yearlyTotalsTable;
  };

  setSliderActive = () => {
    if (this.state.sliderActive === false && isMounted) {
      this.setState({
        sliderActive: true,
      });
    }
  };

  updateIonRangeSliderLabels = (data) => {
    const { from_value, to_value } = data;
    const years = mapPage.treeCoverLossYearsFC;
    years.forEach((year) => {
      if (year > to_value || year < from_value) {
        $(`.southeast-asia-slider__container .irs-grid-text:contains("${year}")`).addClass(
          'irs-inactive-year'
        );
      } else {
        $(`.southeast-asia-slider__container .irs-grid-text:contains("${year}")`).removeClass(
          'irs-inactive-year'
        );
      }
    });
  };

  setSliderRange = (data) => {
    this.updateIonRangeSliderLabels(data);
    if (isMounted) {
      this.setState({
        startYear: data.from_value,
        endYear: data.to_value,
        sliderActive: false,
      });
      gtag('event', 'timeslider update', {
        ''event_category'': 'Diagnostics Click',
        ''event_label'': 'user updated the southeast asia timeslider',
      });
    }
  };

  getYearlyTotalData = () => {
    const { parseYearlyData } = this.props;
    const { startYear, endYear } = this.state;
    return {
      totalTCL: parseYearlyData('tree_cover_loss_total_yearly', startYear, endYear),
      sea: parseYearlyData('tree_cover_loss_sea_landcover_yearly', startYear, endYear),
      idnTCL: parseYearlyData('tree_cover_loss_idn_landcover_yearly', startYear, endYear),
      idnLegalTCL: parseYearlyData('tree_cover_loss_idn_legal_yearly', startYear, endYear),
      idnMoratoriumTCL: parseYearlyData(
        'tree_cover_loss_idn_forest_moratorium_yearly',
        startYear,
        endYear
      ),
      idnPrimaryForestTCL: parseYearlyData(
        'tree_cover_loss_idn_primary_forest_yearly',
        startYear,
        endYear
      ),
    };
  };
}
