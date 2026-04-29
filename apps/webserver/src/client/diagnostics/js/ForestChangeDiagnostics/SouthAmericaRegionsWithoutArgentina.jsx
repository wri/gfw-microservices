import { Fragment, Component } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Highcharts from 'highcharts';
import _range from 'lodash/range';
import ProdesLegend from './SouthAmericaRegions/ProdesLegend';
import DiagnosticsChartHeader from '../common/DiagnosticsChartHeader';
import {
  formatNum,
  formatPct,
  prettifyNum,
  validatePct,
  getFormattedTooltipForDiagnosticsChart,
} from '../../../common/js/utils/diagnostics.utils';
import {
  latestTreeCoverLossYearForTclDataInMap,
  locationsPage,
  prodesYearsRange,
} from '../../../common/js/config';
import { PRODES_HIGHCHARTS_BAR_CONFIGS } from './SouthAmericaRegions/SouthAmericaRegions.config';
import infoBubbleConfig from '../../../common/js/infoBubbleConfig.constants';
import '../../../common/css/_irsBase.scss';
import '../../../common/css/_irsStyle.scss';

const PROTECTED_AREAS_COLOR = '#818181';

const START_YEAR = 2001;
const END_YEAR = latestTreeCoverLossYearForTclDataInMap;
const END_YEAR_SOY_PLANTED = 2023; // This is a workaround for soy planted data end year to be different from the others; revert the code that uses this constant once this validation is no longer needed.
const HARVEST_YEAR = END_YEAR - 1;
let isMounted = false;
const transifex = (text) => window.Transifex?.live?.translateText?.(text) ?? text;
export default class SouthAmericaRegionsWithoutArgentina extends Component {
  constructor(props) {
    super(props);
    this.state = {
      soyChecked: true,
      prodesChecked: false,
      paChecked: false,
      saTCLChecked: false,
      biomesChecked: false,
      startYear: START_YEAR,
      endYear: END_YEAR,
      sliderActive: false,
      cerradoBiome: false,
      brazilianBiomes: false,
    };
  }

  getYearsRange = () => {
    const { prodesChecked, paChecked } = this.state;
    if (prodesChecked && !paChecked) {
      return _range(prodesYearsRange.from, prodesYearsRange.to + 1);
    }
    return _range(START_YEAR, END_YEAR + 1);
  };

  componentDidMount() {
    const { brazilianBiomes, cerradoBiome } = this.state;
    isMounted = true;

    if ($('#south-american-slider').ionRangeSlider) {
      const yearsRange = this.getYearsRange();
      $('#south-american-slider').ionRangeSlider({
        type: 'double',
        values: yearsRange,
        hide_min_max: true,
        from_min: 0,
        from_max: yearsRange.length - 1,
        grid: true,
        grid_snap: true,
        from: 0,
        to: yearsRange.length - 1,
        onChange: this.sliderChanging,
        onFinish: this.changeCanopyDensity,
        prettify: (value) => value,
      });
    }

    let shouldSet = false;
    const newState = {};
    const filteredLocations = this.props.getFilteredLocations();
    const inCerradoBiome = filteredLocations
      .map((l) => JSON.parse(l.cerrado_biome_presence))
      .some((l) => l === true);
    const inBrazilianBiomes = filteredLocations
      .map((l) => JSON.parse(l.brazil_biomes_presence))
      .some((l) => l === true);

    if (cerradoBiome !== inCerradoBiome) {
      newState.cerradoBiome = inCerradoBiome;
    }
    if (brazilianBiomes !== inBrazilianBiomes) {
      newState.brazilianBiomes = inBrazilianBiomes;
    }

    if (inCerradoBiome) {
      newState.soyChecked = true;
      newState.prodesChecked = false;
      newState.paChecked = false;
      newState.biomesChecked = false;
      newState.saTCLChecked = false;
    } else if (inBrazilianBiomes) {
      // ?
      newState.biomesChecked = true;
      newState.soyChecked = false;
      newState.prodesChecked = false;
      newState.paChecked = false;
      newState.saTCLChecked = false;
    } else {
      newState.saTCLChecked = true;
      newState.soyChecked = false;
      newState.prodesChecked = false;
      newState.paChecked = false;
      newState.biomesChecked = false;
    }

    Object.keys(newState).forEach((stateProp) => {
      if (newState[stateProp] !== this.state[stateProp]) {
        shouldSet = true;
      }
    });

    if (shouldSet && isMounted) {
      this.setState(newState);
    }

    this.renderChart(this.refs.soyChart);
    this.renderPie(this.refs.southAmericanPie);
  }

  componentWillUnmount() {
    isMounted = false;
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      soyChecked,
      prodesChecked,
      paChecked,
      saTCLChecked,
      biomesChecked,
      startYear,
      endYear,
      cerradoBiome,
      brazilianBiomes,
    } = this.state;
    if (
      prevState.soyChecked !== soyChecked ||
      prevState.prodesChecked !== prodesChecked ||
      prevState.paChecked !== paChecked ||
      prevState.saTCLChecked !== saTCLChecked ||
      prevState.biomesChecked !== biomesChecked ||
      prevState.startYear !== startYear ||
      prevState.endYear !== endYear ||
      prevState.cerradoBiome !== cerradoBiome ||
      prevState.brazilianBiomes !== brazilianBiomes
    ) {
      // if a checkbox to select a chart changed, re render the chart
      this.renderChart(this.refs.soyChart);
      this.renderPie(this.refs.southAmericanPie);

      // Update slider when prodesChecked or paChecked changes
      if (prevState.prodesChecked !== prodesChecked || prevState.paChecked !== paChecked) {
        const yearsRange = this.getYearsRange();
        const newStartYear = yearsRange[0];
        const newEndYear = yearsRange[yearsRange.length - 1];
        const slider = $('#south-american-slider').data('ionRangeSlider');
        if (slider) {
          slider.update({
            values: yearsRange,
            from_max: yearsRange.length - 1,
            to: yearsRange.length - 1,
          });
        }
        // Update startYear and endYear state to match the new range
        if (isMounted && (startYear !== newStartYear || endYear !== newEndYear)) {
          this.setState({
            startYear: newStartYear,
            endYear: newEndYear,
          });
        }
      }
    }

    if (
      !soyChecked &&
      !prodesChecked &&
      !paChecked &&
      !saTCLChecked &&
      !biomesChecked &&
      isMounted
    ) {
      this.setState({ soyChecked: true });
    }
  }

  updateIonRangeSliderLabels = (data) => {
    const { from_value, to_value } = data;
    const yearsRange = this.getYearsRange();
    yearsRange.forEach((year) => {
      if (year > to_value || year < from_value) {
        $(`.south-america-slider__container .irs-grid-text:contains("${year}")`).addClass(
          'irs-inactive-year'
        );
      } else {
        $(`.south-america-slider__container .irs-grid-text:contains("${year}")`).removeClass(
          'irs-inactive-year'
        );
      }
    });
  };

  changeCanopyDensity = (data) => {
    this.updateIonRangeSliderLabels(data);
    if (isMounted) {
      this.setState({
        startYear: data.from_value,
        endYear: data.to_value,
        sliderActive: false,
      });
      gtag('event', 'timeslider update', {
        event_category: 'Diagnostics Click',
        event_label: 'user updated the south america timeslider',
      });
    }
  };

  sliderChanging = () => {
    if (this.state.sliderActive === false && isMounted) {
      this.setState({
        sliderActive: true,
      });
    }
  };

  renderPie = (ref) => {
    const { biomesChecked } = this.state;
    const { getFilteredLocations, assignHighchartColor } = this.props;
    const filteredLocations = getFilteredLocations();

    if (biomesChecked) {
      const brazilBiomeLocations = filteredLocations.map((location) =>
        JSON.parse(location.brazil_biomes)
      );
      const result = {};
      brazilBiomeLocations.forEach((location) => {
        Object.entries(location).forEach((pair) => {
          const [category, value] = pair;
          if (result[category] !== undefined) {
            result[category] += value;
          } else {
            result[category] = value;
          }
        });
      });

      let total = 0;

      if (brazilBiomeLocations.length > 0) {
        brazilBiomeLocations.forEach((location) => {
          total += Object.values(location).reduce((preValue, currValue) => preValue + currValue, 0);
        });
      }

      let overlapCategoryNames;
      if (brazilBiomeLocations.length > 0) {
        overlapCategoryNames = Object.entries(brazilBiomeLocations[0]).map(
          (category) => category[0]
        );
      }

      this.renderChart(this.refs.soyChart, overlapCategoryNames);

      const serie = Object.entries(result).map((biome) => {
        const [name, value] = biome;
        return {
          name,
          color: assignHighchartColor(name),
          y: (value / total) * 100,
        };
      });

      const series = [
        {
          name: 'Brazil Biomes',
          data: [],
        },
      ];

      series[0].data = serie;

      return Highcharts.chart({
        chart: {
          renderTo: ref,
          type: 'pie',
        },
        title: {
          text: '',
        },
        tooltip: {
          headerFormat: '<table style="background-color:#fff;border: 4px solid #fff">',
          pointFormatter() {
            return (
              '<tr>' +
              `<td style="color:${this.color};padding:0">${transifex(this.name)}:</td>` +
              `<td style="padding:0"><b style="padding-left:0.25rem">${formatPct(
                this.y
              )}%</b></td>` +
              '</tr>'
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
              formatter() {
                return `<b>${transifex(this.point.name)}: </b>${formatPct(this.percentage)}%`;
              },
              style: {
                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black',
              },
              filter: {
                property: 'percentage',
                operator: '>',
                value: 1,
              },
            },
          },
        },
        series,
        credits: {
          enabled: false,
        },
      });
    }
    return null;
  };

  renderChart = (el, overlapCategoryNames) => {
    const { getYearlyData, getYearlyHighchartSeries, getCategoricalHighchartSeries } = this.props;
    const {
      startYear,
      endYear,
      soyChecked,
      prodesChecked,
      paChecked,
      saTCLChecked,
      biomesChecked,
    } = this.state;

    const plotBands = [];
    const plotLines = [];
    const series = [];

    if (soyChecked) {
      series.push({
        name: 'Soy on Tree Cover Loss',
        data: getYearlyHighchartSeries(
          getYearlyData('tree_cover_loss_soy_yearly', startYear, END_YEAR_SOY_PLANTED)
        ),
        color: '#ef669a',
        stack: 'soy',
        groupPadding: 0,
        showInLegend: false,
      });

      plotBands.push({
        color: 'rgba(229,229,223, .5)',
        from: HARVEST_YEAR,
        to: HARVEST_YEAR + 1,
        label: {
          text: 'HARVEST YEAR',
          align: 'right',
          y: 330,
        },
      });

      plotLines.push({
        value: HARVEST_YEAR,
        width: 2,
        color: '#555555',
      });
    }

    if (prodesChecked) {
      const highchartProdesData = {
        name: locationsPage.diagnosticsTitles.PRODES_AMAZON,
        data: getYearlyHighchartSeries(getYearlyData('prodes', startYear, endYear)),
        color: '#ef669a',
        groupPadding: 0,
        stack: 'prodes',
        showInLegend: false,
      };
      highchartProdesData.data.map((bar) => {
        const [filteredConfig] = PRODES_HIGHCHARTS_BAR_CONFIGS.filter((barconfig) =>
          barconfig.years.includes(bar.x)
        );
        bar.color = filteredConfig.color;
        bar.label = filteredConfig.label;
        bar.type = filteredConfig.type;
        return { bar };
      });
      series.push(highchartProdesData);
    }

    if (paChecked) {
      series.push({
        name: 'Protected Areas',
        data: getYearlyHighchartSeries(getYearlyData('prodes_wdpa', startYear, endYear)),
        color: PROTECTED_AREAS_COLOR,
        groupPadding: 0,
        stack: 'pa',
        showInLegend: false,
      });
    }

    if (saTCLChecked) {
      series.push({
        name: 'Tree Cover Loss',
        data: getYearlyHighchartSeries(
          getYearlyData('tree_cover_loss_total_yearly', startYear, endYear)
        ),
        color: '#ef669a',
        groupPadding: 0,
        stack: 'tcl',
        showInLegend: false,
      });
    }

    if (biomesChecked) {
      const brazilSeries = getCategoricalHighchartSeries(
        'tree_cover_loss_brazil_biomes_yearly',
        startYear,
        endYear
      );
      series.push(...brazilSeries);
    }

    let filteredSeries;
    if (overlapCategoryNames) {
      filteredSeries = series.filter((serie) => overlapCategoryNames.includes(serie.name));
      // Add these back in if they are also checked with Brazil Biomes
      if (paChecked) {
        filteredSeries.push({
          name: 'Protected Areas',
          data: getYearlyHighchartSeries(getYearlyData('prodes_wdpa', startYear, endYear)),
          color: PROTECTED_AREAS_COLOR,
          groupPadding: 0,
          stack: 'pa',
          showInLegend: false,
        });
      }
      if (saTCLChecked) {
        filteredSeries.push({
          name: 'Tree Cover Loss',
          data: getYearlyHighchartSeries(
            getYearlyData('tree_cover_loss_total_yearly', startYear, endYear)
          ),
          color: '#ef669a',
          groupPadding: 0,
          stack: 'tcl',
          showInLegend: false,
        });
      }
    }
    const chartSeries = filteredSeries || series;

    return Highcharts.chart({
      chart: {
        marginBottom: 100,
        renderTo: el,
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
          text: `<div class="SouthAmericaRegions__hc-xAxis--title">${transifex('Years')}</div>`,
        },
        plotBands,
        plotLines,
        labels: {
          formatter() {
            return `'${this.value.toString().slice(-2)}`;
          },
        },
      },
      yAxis: {
        min: 0,
        title: {
          useHTML: true,
          text: '<div class="SouthAmericaRegions__hc-yAxis--title">ha</div>',
        },
      },
      tooltip: {
        headerFormat: '<table>',
        pointFormatter() {
          return getFormattedTooltipForDiagnosticsChart.call(this);
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
      legend: {
        enabled: false,
      },
    });
  };

  handlePrimaryForestCheck = () => {
    const { paChecked } = this.state;
    this.setState({
      paChecked: paChecked,
      soyChecked: false,
      saTCLChecked: false,
      biomesChecked: false,
    });
  };

  handleProtectedAreaCheck = () => {
    const { paChecked } = this.state;
    const nextProtectedAreaState = !paChecked;
    this.setState({
      paChecked: nextProtectedAreaState,
      soyChecked: false,
      saTCLChecked: false,
      biomesChecked: false,
    });
  };

  renderSouthAmericaTable = (totals) => {
    const { soyChecked, prodesChecked, paChecked, saTCLChecked, biomesChecked, brazilianBiomes } =
      this.state;

    let checked;
    let onChange;
    let label;
    let child = false;
    let disabled = false;
    let dataCy = '';

    return Object.entries(totals).map((entry) => {
      const [category, value] = entry;
      switch (category) {
        case 'totalSoy':
          label = 'Soy on Tree Cover Loss';
          checked = soyChecked;
          child = false;
          disabled = !value;
          dataCy = 'soy-cover-loss';
          onChange = () => {
            this.setState({
              soyChecked: !this.state.soyChecked,
              prodesChecked: false,
              paChecked: false,
              saTCLChecked: false,
              biomesChecked: false,
            });
            gtag('event', 'South America Asia checkbox clicked', {
              event_category: 'Forest Change Diagnostics Click',
              event_label: 'user checked soy on tree cover loss',
            });
          };
          break;
        case 'totalProdes':
          label = 'PRODES';
          checked = prodesChecked;
          child = true;
          disabled = !brazilianBiomes;
          dataCy = 'prodes';
          onChange = () => {
            this.setState({
              soyChecked: false,
              prodesChecked: !this.state.prodesChecked,
              saTCLChecked: false,
              biomesChecked: false,
            });
            gtag('event', 'South America Asia checkbox clicked', {
              event_category: 'Forest Change Diagnostics Click',
              event_label: 'user checked prodes',
            });
          };
          break;
        case 'totalPA':
          label = 'Protected Areas';
          checked = paChecked;
          child = true;
          disabled = value === 0;
          dataCy = 'protected-areas';
          onChange = () => {
            this.handleProtectedAreaCheck();
            gtag('event', 'South America Asia checkbox clicked', {
              event_category: 'Forest Change Diagnostics Click',
              event_label: 'user checked protected areas',
            });
          };
          break;
        case 'saTotalTCL':
          label = 'Tree Cover Loss';
          checked = saTCLChecked;
          child = true;
          disabled = false;
          dataCy = 'tree-cover-loss';
          onChange = () => {
            this.setState({
              soyChecked: false,
              prodesChecked: false,
              paChecked: false,
              saTCLChecked: !this.state.saTCLChecked,
            });
            gtag('event', 'South America Asia checkbox clicked', {
              event_category: 'Forest Change Diagnostics Click',
              event_label: 'user checked tree cover loss',
            });
          };
          break;

        case 'totalBiomes':
          label = 'Brazil Biomes';
          checked = biomesChecked;
          child = true;
          disabled = !brazilianBiomes;
          dataCy = 'brazil-biomes';
          onChange = () => {
            this.setState({
              soyChecked: false,
              prodesChecked: false,
              paChecked: false,
              biomesChecked: !this.state.biomesChecked,
            });
            gtag('event', 'South America Asia checkbox clicked', {
              event_category: 'Forest Change Diagnostics Click',
              event_label: 'user checked brazil biomes',
            });
          };
          break;
      }
      const totalLoss = value;
      const formattedTotalLoss = prettifyNum(formatNum(totalLoss));
      return (
        <Fragment key={crypto.randomUUID()}>
          <tr
            key={`south-america__${category}`}
            className={`locations-diagnostics-table__row ${child ? 'child' : 'parent'}`}
          >
            <th className="locations-diagnostics-table__column" data-cy={dataCy}>
              <input
                id={`${category}-checkbox`}
                className={child ? 'grey' : 'pink'}
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
              />
              <label
                htmlFor={`${category}-checkbox`}
                className={`legend-square-label ${disabled ? 'peat-disabled' : ''}`}
              >
                {label}
              </label>
            </th>

            {child && !['totalBiomes', 'totalProdes'].includes(category) ? (
              <td className="right">{disabled ? '--' : formattedTotalLoss}</td>
            ) : (
              <th className="right">{disabled ? '--' : formattedTotalLoss}</th>
            )}
          </tr>
          {prodesChecked && label === 'PRODES' && (
            <ProdesLegend
              data={this.props.getYearlyData('prodes', this.state.startYear, this.state.endYear)}
            />
          )}
        </Fragment>
      );
    });
  };

  renderBrazilBiomeTable = () => {
    const result = {};
    const { assignHighchartColor } = this.props;
    const { startYear, endYear, biomesChecked } = this.state;

    if (biomesChecked) {
      const filteredLocations = this.props.getFilteredLocations();
      const brazilBiomeLocations = filteredLocations.map((obj) =>
        JSON.parse(obj.tree_cover_loss_brazil_biomes_yearly)
      );

      brazilBiomeLocations.forEach((location) => {
        Object.entries(location).forEach((biome) => {
          const [biomeName, yearlyData] = biome;

          if (result[biomeName]) {
            Object.entries(yearlyData).forEach((year) => {
              const [yr, value] = year;
              if (yr >= startYear && yr <= endYear) {
                result[biomeName] += value;
              }
            });
          } else {
            let totalForBiome = 0;
            Object.entries(yearlyData).forEach((year) => {
              const [yr, value] = year;
              if (yr >= startYear && yr <= endYear) {
                totalForBiome += value;
              }
            });
            result[biomeName] = totalForBiome;
          }
        });
      });

      const resultSorted = {};
      const entriesSorted = Object.entries(result).sort((a, b) => b[1] - a[1]);
      for (const entry of entriesSorted) {
        resultSorted[entry[0]] = entry[1];
      }

      return Object.entries(resultSorted).map((biome, idx) => {
        const [name, value] = biome;
        const color = assignHighchartColor(name);
        return (
          <tr key={`${name}-${idx}`} className="locations-diagnostics-table__row child">
            <td className="locations-diagnostics-table__column indent legend-square-label">
              <div className="legend-square" style={{ backgroundColor: color }} />
              <span>{name}</span>
            </td>
            <td className="right">{prettifyNum(formatNum(value))}</td>
          </tr>
        );
      });
    }
    return null;
  };

  renderBrazilBiomePercentTable = () => {
    const { biomesChecked } = this.state;
    const { getFilteredLocations, assignHighchartColor } = this.props;

    if (biomesChecked) {
      const filteredLocations = getFilteredLocations();

      const brazilBiomeLocations = filteredLocations.map((location) =>
        JSON.parse(location.brazil_biomes)
      );

      const result = {};
      brazilBiomeLocations.forEach((location) => {
        Object.entries(location).forEach((pair) => {
          const [category, value] = pair;
          if (result[category]) {
            result[category] += value;
          } else {
            result[category] = value;
          }
        });
      });

      let total = 0;

      if (brazilBiomeLocations.length > 0) {
        brazilBiomeLocations.forEach((location) => {
          total += Object.values(location).reduce((preValue, currValue) => preValue + currValue, 0);
        });
      }

      const resultSorted = {};
      const entriesSorted = Object.entries(result).sort((a, b) => b[1] - a[1]);
      for (const entry of entriesSorted) {
        resultSorted[entry[0]] = entry[1];
      }

      return Object.entries(resultSorted).map((biome, idx) => {
        const [name, value] = biome;
        const color = assignHighchartColor(name);
        return (
          <tr key={`${name}-${idx}`} className="locations-diagnostics-table__row child">
            <td className="locations-diagnostics-table__column">
              <div className="landcover-table-cell__color" style={{ backgroundColor: color }} />
              <span>{name}</span>
            </td>
            <td className="right">{`${formatPct(validatePct((value / total) * 100))}%`}</td>
          </tr>
        );
      });
    }
    return null;
  };

  processTotals = () => {
    const { parseYearlyData } = this.props;
    const { startYear, endYear } = this.state;

    return {
      totalSoy: parseYearlyData('tree_cover_loss_soy_yearly', startYear, END_YEAR_SOY_PLANTED),
      totalProdes: parseYearlyData('prodes', startYear, endYear),
      totalPA: parseYearlyData('prodes_wdpa', startYear, endYear),
      saTotalTCL: parseYearlyData('tree_cover_loss_total_yearly', startYear, endYear),
      totalBiomes: parseYearlyData('tree_cover_loss_brazil_biomes_yearly', startYear, endYear),
    };
  };

  getRegionCountLabel = () => {
    const { diagnosticView, filteredData, getFilteredLocations } = this.props;
    const filteredLocations = getFilteredLocations();
    const numerator =
      diagnosticView === 'LIST'
        ? filteredData.filter((l) => l.south_america_presence).length
        : filteredLocations.filter((l) => l.south_america_presence === 'true').length;
    return {
      count: numerator,
    };
  };

  checkBrazilBiome = () => {
    const { getFilteredLocations } = this.props;
    const { biomesChecked } = this.state;
    const filteredLocations = getFilteredLocations();
    if (biomesChecked) {
      return filteredLocations
        .map((l) => JSON.parse(l.brazil_biomes))
        .some((l) => Object.keys(l).length > 0);
    }
    return false;
  };

  render() {
    const { prodesChecked, paChecked, saTCLChecked, biomesChecked, sliderActive } = this.state;

    const totals = this.processTotals();
    const totalsTable = this.renderSouthAmericaTable(totals);
    const brazilBiomesTable = this.renderBrazilBiomeTable();
    const brazilBiomePercentTable = this.renderBrazilBiomePercentTable();

    const regionObject = this.getRegionCountLabel();

    const { TREE_COVER_LOSS, PRODES_AMAZON, SOY_ON_TREE_COVER_LOSS } =
      locationsPage.diagnosticsTitles;
    let title;

    if (saTCLChecked || biomesChecked) {
      title = TREE_COVER_LOSS;
    } else if (prodesChecked || paChecked) {
      title = PRODES_AMAZON;
    } else {
      title = SOY_ON_TREE_COVER_LOSS;
    }

    const displayBrazilBiomeSection = this.checkBrazilBiome();

    let informationBubbleId;
    if (prodesChecked || paChecked) {
      informationBubbleId = infoBubbleConfig.regionsProdesAnnual;
    } else if (saTCLChecked || biomesChecked) {
      informationBubbleId = infoBubbleConfig.regionsSaAnnual;
    } else {
      informationBubbleId = infoBubbleConfig.regionsSoyAnnual;
    }

    return (
      <div className={`${regionObject.count > 0 ? '' : 'hidden'}`}>
        <DiagnosticsChartHeader
          title={title}
          informationBubbleId={informationBubbleId}
          fireDownload={this.props.fireDownload}
          downloadId={'southAmericaTCL'}
        />
        <Card>
          <CardContent>
            <div className="locations-diagnostics__subsection section__south-america">
              <div className="subsection-chart" style={{ paddingTop: '17px' }}>
                <div className="chart-container">
                  <div ref="soyChart" />
                </div>
              </div>

              <div className="locations-diagnostics-table">
                <table>
                  <thead>
                    <tr>
                      <th />
                      <th className="label right">Total Loss (ha)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totalsTable}
                    {this.state.biomesChecked ? brazilBiomesTable : null}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              className={`print-no-break locations-diagnostics__subsection ${
                displayBrazilBiomeSection ? '' : 'hidden'
              }`}
            >
              <div className="subsection-chart">
                <div className="locations-diagnostics__flex-center subsection-subtitle__container">
                  <DiagnosticsChartHeader
                    title={'Brazil Biomes Percent Overlap'}
                    informationBubbleId={infoBubbleConfig.regionsSaBiomes}
                    fireDownload={this.props.fireDownload}
                    downloadId={'southAmericaOverlap'}
                  />
                </div>
                <div className="chart-container">
                  <div ref="southAmericanPie" />
                </div>
              </div>
              <div className="locations-diagnostics-table locations-diagnostics-table--pie">
                <table>
                  <thead>
                    <tr>
                      <th>Brazil Biome</th>
                      <th className="label right">Percent Loss</th>
                    </tr>
                  </thead>
                  <tbody>{brazilBiomePercentTable}</tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="locations-diagnostics-subsection">
          <div
            className={`south-america-slider__container slider__container ${
              sliderActive ? 'slider-active' : ''
            }`}
          >
            <input id="south-american-slider" />
          </div>
        </div>
      </div>
    );
  }
}
