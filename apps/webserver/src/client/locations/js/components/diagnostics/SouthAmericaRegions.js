import React, { Component } from 'react';
import Highcharts from 'highcharts';
import _range from 'lodash/range';
import { v1 as uuidv1 } from 'uuid';
import ProdesLegend from './SouthAmericaRegions/ProdesLegend';
import IconButtonWrapper from '../IconButtonWrapper';
import OtbnAreaChart from './OtbnCharts/OtbnAreaChart';
import { otbnChartsColors } from './OtbnCharts/OtbnChartsColors.constants';
import getTreeCoverLossArgOtbnYearlyData from './OtbnCharts/TreeCoverLossArgentinaOtbnYearly/getTreeCoverLossArgOtbnYearlyData';
import { formatNum, formatPct, prettifyNum, validatePct } from '../../utils/diagnostics.utils';
import { latestTreeCoverLossYearFC, locationsPage } from '../../../../common/js/config';
import { PRODES_HIGHCHARTS_BAR_CONFIGS } from './SouthAmericaRegions/SouthAmericaRegions.config';
import '../../../../common/css/_irsBase.scss';
import '../../../../common/css/_irsStyle.scss';
import './OtbnCharts/OtbnAreaChart/OtbnTable.scss';

const PRIMARY_FOREST_COLOR = '#818181';
const PROTECTED_AREAS_COLOR = '#818181';

const START_YEAR = 2001;
const END_YEAR = latestTreeCoverLossYearFC;
const HARVEST_YEAR = END_YEAR - 1;
const YEARS_RANGE = _range(START_YEAR, END_YEAR + 1);
let isMounted = false;

function getFormatedTooltip() {
  const { color: optionsColor, label, type } = this.options;
  const { color: seriesColor, name } = this.series;
  return `<tr>
<td style="color:${optionsColor || seriesColor};padding:0">${
    type === 'PRODES' ? `${type} (${label})` : name
  }: </td>
<td style="padding-top:0; padding-bottom: 0"><b>${prettifyNum(formatNum(this.y || 0))} ha</b></td>
</tr>`;
}

export default class SouthAmericaRegions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      soyChecked: true,
      prodesChecked: false,
      paChecked: false,
      pfChecked: false,
      saTCLChecked: false,
      otbnArgentinaChecked: false,
      otbnArgentinaShowCategoryIChecked: false,
      otbnArgentinaShowCategoryIIChecked: false,
      otbnArgentinaShowCategoryIIIChecked: false,
      biomesChecked: false,
      startYear: START_YEAR,
      endYear: END_YEAR,
      sliderActive: false,
      legalAmazon: false,
      cerradoBiome: false,
      brazilianBiomes: false,
    };
  }

  componentDidMount() {
    const { legalAmazon, brazilianBiomes, cerradoBiome } = this.state;
    isMounted = true;

    if ($('#south-american-slider').ionRangeSlider) {
      $('#south-american-slider').ionRangeSlider({
        type: 'double',
        values: YEARS_RANGE,
        hide_min_max: true,
        from_min: 0,
        from_max: END_YEAR - START_YEAR,
        grid: true,
        grid_snap: true,
        from: 0,
        to: END_YEAR - START_YEAR,
        onChange: this.sliderChanging,
        onFinish: this.changeCanopyDensity,
        prettify: (value) => value,
      });
    }

    let shouldSet = false;
    const newState = {};
    const filteredLocations = this.props.getFilteredLocations();
    const inLegalAmazon = filteredLocations
      .map((l) => JSON.parse(l.legal_amazon_presence))
      .some((l) => l === true);
    const inCerradoBiome = filteredLocations
      .map((l) => JSON.parse(l.cerrado_biome_presence))
      .some((l) => l === true);
    const inBrazilianBiomes = filteredLocations
      .map((l) => JSON.parse(l.brazil_biomes_presence))
      .some((l) => l === true);

    if (legalAmazon !== inLegalAmazon) {
      newState.legalAmazon = inLegalAmazon;
    }
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
      newState.pfChecked = false;
      newState.biomesChecked = false;
      newState.saTCLChecked = false;
    } else if (inLegalAmazon) {
      newState.prodesChecked = true;
      newState.soyChecked = false;
      newState.biomesChecked = false;
      newState.saTCLChecked = false;
    } else if (inBrazilianBiomes) {
      // ?
      newState.biomesChecked = true;
      newState.soyChecked = false;
      newState.prodesChecked = false;
      newState.paChecked = false;
      newState.pfChecked = false;
      newState.saTCLChecked = false;
    } else {
      newState.saTCLChecked = true;
      newState.soyChecked = false;
      newState.prodesChecked = false;
      newState.paChecked = false;
      newState.pfChecked = false;
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

    const { view } = this.props;
    if (view === 'diagnostics') {
      this.renderChart(this.refs.soyChart);
      this.renderPie(this.refs.southAmericanPie);
    }
  }

  componentWillUnmount() {
    isMounted = false;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.view === 'diagnostics' && this.props.view !== 'diagnostics') {
      let shouldSet = false;
      const newState = {};
      const filteredLocations = this.props.getFilteredLocations();
      const inLegalAmazon = filteredLocations
        .map((l) => JSON.parse(l.legal_amazon_presence))
        .some((l) => l === true);
      const inCerradoBiome = filteredLocations
        .map((l) => JSON.parse(l.cerrado_biome_presence))
        .some((l) => l === true);
      const inBrazilianBiomes = filteredLocations
        .map((l) => JSON.parse(l.brazil_biomes_presence))
        .some((l) => l === true);

      if (this.state.legalAmazon !== inLegalAmazon) {
        newState.legalAmazon = inLegalAmazon;
      }
      if (this.state.cerradoBiome !== inCerradoBiome) {
        newState.cerradoBiome = inCerradoBiome;
      }
      if (this.state.brazilianBiomes !== inBrazilianBiomes) {
        newState.brazilianBiomes = inBrazilianBiomes;
      }

      if (inCerradoBiome) {
        newState.soyChecked = true;
        newState.prodesChecked = false;
        newState.paChecked = false;
        newState.pfChecked = false;
        newState.biomesChecked = false;
        newState.saTCLChecked = false;
      } else if (inLegalAmazon) {
        newState.prodesChecked = true;
        newState.soyChecked = false;
        newState.biomesChecked = false;
        newState.saTCLChecked = false;
      } else if (inBrazilianBiomes) {
        // ?
        newState.biomesChecked = true;
        newState.soyChecked = false;
        newState.prodesChecked = false;
        newState.paChecked = false;
        newState.pfChecked = false;
        newState.saTCLChecked = false;
      } else {
        newState.saTCLChecked = true;
        newState.soyChecked = false;
        newState.prodesChecked = false;
        newState.paChecked = false;
        newState.pfChecked = false;
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

      if (isMounted) {
        this.setState(
          {
            startYear: START_YEAR,
            endYear: END_YEAR,
            soyChecked: true,
            prodesChecked: false,
            paChecked: false,
            pfChecked: false,
            saTCLChecked: false,
            biomesChecked: false,
          },
          () => {
            const slider = $('#south-american-slider').data('ionRangeSlider');
            slider.update({
              from: 0,
              to: END_YEAR - START_YEAR,
            });
          }
        );
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      soyChecked,
      prodesChecked,
      paChecked,
      pfChecked,
      saTCLChecked,
      otbnArgentinaChecked,
      otbnArgentinaShowCategoryIChecked,
      otbnArgentinaShowCategoryIIChecked,
      otbnArgentinaShowCategoryIIIChecked,
      biomesChecked,
      startYear,
      endYear,
      legalAmazon,
      cerradoBiome,
      brazilianBiomes,
    } = this.state;
    if (
      (prevProps.view !== 'diagnostics' && this.props.view === 'diagnostics') ||
      prevState.soyChecked !== soyChecked ||
      prevState.prodesChecked !== prodesChecked ||
      prevState.paChecked !== paChecked ||
      prevState.pfChecked !== pfChecked ||
      prevState.saTCLChecked !== saTCLChecked ||
      prevState.otbnArgentinaChecked !== otbnArgentinaChecked ||
      prevState.otbnArgentinaShowCategoryIChecked !== otbnArgentinaShowCategoryIChecked ||
      prevState.otbnArgentinaShowCategoryIIChecked !== otbnArgentinaShowCategoryIIChecked ||
      prevState.otbnArgentinaShowCategoryIIIChecked !== otbnArgentinaShowCategoryIIIChecked ||
      prevState.biomesChecked !== biomesChecked ||
      prevState.startYear !== startYear ||
      prevState.endYear !== endYear ||
      prevState.legalAmazon !== legalAmazon ||
      prevState.cerradoBiome !== cerradoBiome ||
      prevState.brazilianBiomes !== brazilianBiomes
    ) {
      // if a checkbox to select a chart changed, re render the chart
      this.renderChart(this.refs.soyChart);
      this.renderPie(this.refs.southAmericanPie);
    }

    if (
      !soyChecked &&
      !prodesChecked &&
      !paChecked &&
      !pfChecked &&
      !saTCLChecked &&
      !biomesChecked &&
      !otbnArgentinaChecked &&
      isMounted
    ) {
      this.setState({ soyChecked: true });
    }
  }

  updateIonRangeSliderLabels = (data) => {
    const { from_value, to_value } = data;
    YEARS_RANGE.forEach((year) => {
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
        'event_category': 'Diagnostics Click',
        ''event_label'': 'user updated the south america timeslider',
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
          if (result.hasOwnProperty(category)) {
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
          pointFormatter() {
            return (
              '<tr>' +
              `<td style="color:${this.color};padding:0">${this.name}:</td>` +
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
                return `<b>${this.point.name}: </b>${formatPct(this.percentage)}%`;
              },
              style: {
                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black',
              },
            },
          },
        },
        series,
        credits: {
          enabled: false,
        },
      });
      return chart;
    }
    return null;
  };

  renderChart = (el, overlapCategoryNames) => {
    const {
      getYearlyData,
      getYearlyHighchartSeries,
      getCategoricalHighchartSeries,
      getFilteredLocations,
    } = this.props;
    const {
      startYear,
      endYear,
      soyChecked,
      prodesChecked,
      paChecked,
      pfChecked,
      saTCLChecked,
      otbnArgentinaChecked,
      otbnArgentinaShowCategoryIChecked,
      otbnArgentinaShowCategoryIIChecked,
      otbnArgentinaShowCategoryIIIChecked,
      biomesChecked,
    } = this.state;

    const plotBands = [];
    const plotLines = [];
    const series = [];

    if (soyChecked) {
      series.push({
        name: 'Soy on Tree Cover Loss',
        data: getYearlyHighchartSeries(
          getYearlyData('tree_cover_loss_soy_yearly', startYear, endYear)
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
        data: getYearlyHighchartSeries(
          getYearlyData('tree_cover_loss_prodes_yearly', startYear, endYear)
        ),
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
        data: getYearlyHighchartSeries(
          getYearlyData('tree_cover_loss_prodes_wdpa_yearly', startYear, endYear)
        ),
        color: PROTECTED_AREAS_COLOR,
        groupPadding: 0,
        stack: 'pa',
        showInLegend: false,
      });
    }

    if (pfChecked) {
      series.push({
        name: 'Primary Forest',
        data: getYearlyHighchartSeries(
          getYearlyData('tree_cover_loss_prodes_primary_forest_yearly', startYear, endYear)
        ),
        color: PRIMARY_FOREST_COLOR,
        groupPadding: 0,
        stack: 'pf',
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

    if (otbnArgentinaChecked) {
      const { chartData } = getTreeCoverLossArgOtbnYearlyData(
        getFilteredLocations()[0],
        startYear,
        endYear,
        otbnArgentinaShowCategoryIChecked,
        otbnArgentinaShowCategoryIIChecked,
        otbnArgentinaShowCategoryIIIChecked
      );
      series.push(...chartData);
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
          data: getYearlyHighchartSeries(
            getYearlyData('tree_cover_loss_prodes_wdpa_yearly', startYear, endYear)
          ),
          color: PROTECTED_AREAS_COLOR,
          groupPadding: 0,
          stack: 'pa',
          showInLegend: false,
        });
      }

      if (pfChecked) {
        filteredSeries.push({
          name: 'Primary Forest',
          data: getYearlyHighchartSeries(
            getYearlyData('tree_cover_loss_prodes_primary_forest_yearly', startYear, endYear)
          ),
          color: PRIMARY_FOREST_COLOR,
          groupPadding: 0,
          stack: 'pf',
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

    const chart = new Highcharts.chart({
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
          text: '<div class="SouthAmericaRegions__hc-xAxis--title">Years</div>',
        },
        plotBands,
        plotLines,
        labels: {
          formatter() {
            return `'${this.value.toString().substr(-2)}`;
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
          return getFormatedTooltip.call(this);
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
    return chart;
  };

  handlePrimaryForestCheck = () => {
    const { pfChecked, paChecked } = this.state;
    const nextPrimaryForestState = !pfChecked;
    const nextProtectedAreaState = nextPrimaryForestState ? false : paChecked;
    this.setState({
      pfChecked: nextPrimaryForestState,
      paChecked: nextProtectedAreaState,
      soyChecked: false,
      saTCLChecked: false,
      biomesChecked: false,
    });
  };

  handleProtectedAreaCheck = () => {
    const { pfChecked, paChecked } = this.state;
    const nextProtectedAreaState = !paChecked;
    const nextPrimaryForestState = nextProtectedAreaState ? false : pfChecked;
    this.setState({
      pfChecked: nextPrimaryForestState,
      paChecked: nextProtectedAreaState,
      soyChecked: false,
      saTCLChecked: false,
      biomesChecked: false,
    });
  };

  renderSouthAmericaTable = (totals) => {
    const {
      soyChecked,
      prodesChecked,
      paChecked,
      pfChecked,
      saTCLChecked,
      otbnArgentinaChecked,
      otbnArgentinaShowCategoryIChecked,
      otbnArgentinaShowCategoryIIChecked,
      otbnArgentinaShowCategoryIIIChecked,
      biomesChecked,

      legalAmazon,
      cerradoBiome,
      brazilianBiomes,
      startYear,
      endYear,
    } = this.state;

    let checked;
    let onChange;
    let label;
    let legendColor;
    let child = false;
    let disabled = false;

    return Object.entries(totals).map((entry) => {
      const [category, value] = entry;
      switch (category) {
        case 'totalSoy':
          label = 'Soy on Tree Cover Loss';
          legendColor = checked = soyChecked;
          child = false;
          disabled = !value;
          onChange = () => {
            this.setState({
              soyChecked: !this.state.soyChecked,
              prodesChecked: false,
              paChecked: false,
              pfChecked: false,
              saTCLChecked: false,
              otbnArgentinaChecked: false,
              otbnArgentinaShowCategoryIChecked: false,
              otbnArgentinaShowCategoryIIChecked: false,
              otbnArgentinaShowCategoryIIIChecked: false,
              biomesChecked: false,
            });
            gtag('event', 'South America Asia checkbox clicked', {
              'event_category': 'Forest Change Diagnostics Click',
              ''event_label'': 'user checked soy on tree cover loss',
            });
          };
          break;
        case 'totalProdes':
          label = 'PRODES';
          legendColor = undefined;
          checked = prodesChecked;
          child = true;
          disabled = !brazilianBiomes;
          onChange = () => {
            this.setState({
              soyChecked: false,
              prodesChecked: !this.state.prodesChecked,
              saTCLChecked: false,
              otbnArgentinaChecked: false,
              otbnArgentinaShowCategoryIChecked: false,
              otbnArgentinaShowCategoryIIChecked: false,
              otbnArgentinaShowCategoryIIIChecked: false,
              biomesChecked: false,
            });
            gtag('event', 'South America Asia checkbox clicked', {
              'event_category': 'Forest Change Diagnostics Click',
              ''event_label'': 'user checked prodes',
            });
          };
          break;
        case 'totalPA':
          label = 'Protected Areas';
          legendColor = PROTECTED_AREAS_COLOR;
          checked = paChecked;
          child = true;
          disabled = !(legalAmazon && value !== 0);
          onChange = () => {
            this.handleProtectedAreaCheck();
            gtag('event', 'South America Asia checkbox clicked', {
              'event_category': 'Forest Change Diagnostics Click',
              ''event_label'': 'user checked protected areas',
            });
          };
          break;
        case 'totalPF':
          label = 'Primary Forest';
          legendColor = PRIMARY_FOREST_COLOR;
          checked = pfChecked;
          child = true;
          disabled = !(legalAmazon && value !== 0);
          onChange = () => {
            this.handlePrimaryForestCheck();
            gtag('event', 'South America Asia checkbox clicked', {
              'event_category': 'Forest Change Diagnostics Click',
              ''event_label'': 'user checked primary forest',
            });
          };
          break;
        case 'saTotalTCL':
          label = 'Tree Cover Loss';
          legendColor = 'rgb(255,127,179)';
          checked = saTCLChecked;
          child = true;
          disabled = false;
          onChange = () => {
            this.setState({
              soyChecked: false,
              prodesChecked: false,
              paChecked: false,
              pfChecked: false,
              saTCLChecked: !this.state.saTCLChecked,
              otbnArgentinaChecked: false,
              otbnArgentinaShowCategoryIChecked: false,
              otbnArgentinaShowCategoryIIChecked: false,
              otbnArgentinaShowCategoryIIIChecked: false,
            });
            gtag('event', 'South America Asia checkbox clicked', {
              'event_category': 'Forest Change Diagnostics Click',
              ''event_label'': 'user checked tree cover loss',
            });
          };
          break;
        case 'otbnArgentina':
          label = 'Tree Cover Loss on Argentina OTBN';
          legendColor = 'rgb(255,127,179)';
          checked = otbnArgentinaChecked;
          child = true;
          disabled = !this.isArgentinaOtnbArea();
          onChange = () => {
            this.setState({
              biomesChecked: false,
              soyChecked: false,
              prodesChecked: false,
              paChecked: false,
              pfChecked: false,
              saTCLChecked: false,
              otbnArgentinaChecked: !this.state.otbnArgentinaChecked,
              otbnArgentinaShowCategoryIChecked: !this.state.otbnArgentinaChecked,
              otbnArgentinaShowCategoryIIChecked: !this.state.otbnArgentinaChecked,
              otbnArgentinaShowCategoryIIIChecked: !this.state.otbnArgentinaChecked,
            });
            gtag('event', 'South America Asia checkbox clicked', {
              'event_category': 'Forest Change Diagnostics Click',
              ''event_label'': 'user checked Tree Cover Loss on Argentina OTBN',
            });
          };
          break;
        case 'totalBiomes':
          label = 'Brazil Biomes';
          legendColor = undefined;
          checked = biomesChecked;
          child = true;
          disabled = !brazilianBiomes;
          onChange = () => {
            this.setState({
              soyChecked: false,
              prodesChecked: false,
              paChecked: false,
              pfChecked: false,
              otbnArgentinaChecked: false,
              otbnArgentinaShowCategoryIChecked: false,
              otbnArgentinaShowCategoryIIChecked: false,
              otbnArgentinaShowCategoryIIIChecked: false,
              biomesChecked: !this.state.biomesChecked,
            });
            gtag('event', 'South America Asia checkbox clicked', {
              'event_category': 'Forest Change Diagnostics Click',
              ''event_label'': 'user checked brazil biomes',
            });
          };
          break;
      }
      const totalLoss = category === 'otbnArgentina' ? value.otbnTotalLoss : value;
      const formatedTotalLoss = prettifyNum(formatNum(totalLoss));
      return (
        <React.Fragment key={uuidv1()}>
          <tr
            key={`south-america__${category}`}
            className={`locations-diagnostics-table__row ${child ? 'child' : 'parent'}`}
          >
            <th className="locations-diagnostics-table__column">
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
              <td className="right">{disabled ? '--' : formatedTotalLoss}</td>
            ) : (
              <th className="right">{disabled ? '--' : formatedTotalLoss}</th>
            )}
          </tr>
          {category === 'otbnArgentina' && this.isArgentinaOtnbArea() && (
            <>
              <tr className="locations-diagnostics-table__row child">
                <td className="locations-diagnostics-table__column indent legend-square-label">
                  <input
                    id="otbnArgentinaCategoryI-checkbox"
                    type="checkbox"
                    checked={otbnArgentinaShowCategoryIChecked}
                    onChange={() =>
                      this.setState({
                        otbnArgentinaShowCategoryIChecked: !otbnArgentinaShowCategoryIChecked,
                      })
                    }
                    disabled={!otbnArgentinaChecked}
                  />
                  <label
                    htmlFor="otbnArgentinaCategoryI-checkbox"
                    className={`legend-square-label ${
                      !otbnArgentinaChecked ? 'peat-disabled' : ''
                    }`}
                    style={{ background: 'none' }}
                  >
                    <span
                      className="otbn-checkbox"
                      style={{
                        opacity: otbnArgentinaShowCategoryIChecked ? 1 : 0.2,
                        background: otbnChartsColors['Category I'],
                      }}
                    />
                    Category I
                  </label>
                </td>
                <td className="right">
                  {prettifyNum(formatNum(value?.totalLossByCategory['Category I'])) || ''}
                </td>
              </tr>
              <tr className="locations-diagnostics-table__row child">
                <td className="locations-diagnostics-table__column indent legend-square-label">
                  <input
                    id="otbnArgentinaShowCategoryII-checkbox"
                    type="checkbox"
                    checked={otbnArgentinaShowCategoryIIChecked}
                    onChange={() =>
                      this.setState({
                        otbnArgentinaShowCategoryIIChecked: !otbnArgentinaShowCategoryIIChecked,
                      })
                    }
                    disabled={!otbnArgentinaChecked}
                  />
                  <label
                    htmlFor="otbnArgentinaShowCategoryII-checkbox"
                    className={`legend-square-label ${
                      !otbnArgentinaChecked ? 'peat-disabled' : ''
                    }`}
                    style={{ background: 'none' }}
                  >
                    <span
                      className="otbn-checkbox"
                      style={{
                        opacity: otbnArgentinaShowCategoryIIChecked ? 1 : 0.2,
                        background: otbnChartsColors['Category II'],
                      }}
                    />
                    Category II
                  </label>
                </td>
                <td className="right">
                  {prettifyNum(formatNum(value?.totalLossByCategory['Category II'])) || ''}
                </td>
              </tr>
              <tr className="locations-diagnostics-table__row child">
                <td className="locations-diagnostics-table__column indent legend-square-label">
                  <input
                    id="otbnArgentinaShowCategoryIII-checkbox"
                    type="checkbox"
                    checked={otbnArgentinaShowCategoryIIIChecked}
                    onChange={() =>
                      this.setState({
                        otbnArgentinaShowCategoryIIIChecked: !otbnArgentinaShowCategoryIIIChecked,
                      })
                    }
                    disabled={!otbnArgentinaChecked}
                  />
                  <label
                    htmlFor="otbnArgentinaShowCategoryIII-checkbox"
                    className={`legend-square-label ${
                      !otbnArgentinaChecked ? 'peat-disabled' : ''
                    }`}
                    style={{ background: 'none' }}
                  >
                    <span
                      className="otbn-checkbox"
                      style={{
                        opacity: otbnArgentinaShowCategoryIIIChecked ? 1 : 0.2,
                        background: otbnChartsColors['Category III'],
                      }}
                    />
                    Category III
                  </label>
                </td>
                <td className="right">
                  {prettifyNum(formatNum(value?.totalLossByCategory['Category III'])) || ''}
                </td>
              </tr>
            </>
          )}
          {prodesChecked && label === 'PRODES' && (
            <ProdesLegend
              data={this.props.getYearlyData('tree_cover_loss_prodes_yearly', startYear, endYear)}
            />
          )}
        </React.Fragment>
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

          if (result.hasOwnProperty(biomeName)) {
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
          if (result.hasOwnProperty(category)) {
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
    const { parseYearlyData, getFilteredLocations } = this.props;
    const {
      startYear,
      endYear,
      otbnArgentinaShowCategoryIChecked,
      otbnArgentinaShowCategoryIIChecked,
      otbnArgentinaShowCategoryIIIChecked,
    } = this.state;

    const { totalLossByCategory, otbnTotalLoss } = getTreeCoverLossArgOtbnYearlyData(
      getFilteredLocations()[0],
      startYear,
      endYear,
      otbnArgentinaShowCategoryIChecked,
      otbnArgentinaShowCategoryIIChecked,
      otbnArgentinaShowCategoryIIIChecked
    );

    return {
      totalSoy: parseYearlyData('tree_cover_loss_soy_yearly', startYear, endYear),
      totalProdes: parseYearlyData('tree_cover_loss_prodes_yearly', startYear, endYear),
      totalPA: parseYearlyData('tree_cover_loss_prodes_wdpa_yearly', startYear, endYear),
      totalPF: parseYearlyData('tree_cover_loss_prodes_primary_forest_yearly', startYear, endYear),
      saTotalTCL: parseYearlyData('tree_cover_loss_total_yearly', startYear, endYear),
      otbnArgentina: { totalLossByCategory, otbnTotalLoss },
      totalBiomes: parseYearlyData('tree_cover_loss_brazil_biomes_yearly', startYear, endYear),
    };
  };

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
        ? filteredData.filter((l) => l.south_america_presence).length
        : filteredLocations.filter((l) => l.south_america_presence === 'true').length;
    const numeratorWithCommas = this.withCommas(numerator);
    const filteredDataWithCommas = this.withCommas(filteredData.length);
    return {
      count: numerator,
      label: `Showing data for ${numeratorWithCommas} out of ${
        diagnosticView === 'LIST' ? filteredDataWithCommas : '1'
      } locations`,
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

  isArgentinaOtnbArea = () => {
    const { getFilteredLocations } = this.props;
    return (
      Object.entries(JSON.parse(getFilteredLocations()[0]?.arg_otbn_area || '{}')).length !== 0
    );
  };

  render() {
    const { getFilteredLocations } = this.props;
    const {
      prodesChecked,
      paChecked,
      pfChecked,
      saTCLChecked,
      otbnArgentinaChecked,
      biomesChecked,
      sliderActive,
    } = this.state;

    const totals = this.processTotals();
    const totalsTable = this.renderSouthAmericaTable(totals);
    const brazilBiomesTable = this.renderBrazilBiomeTable();
    const brazilBiomePercentTable = this.renderBrazilBiomePercentTable();

    const regionObject = this.getRegionCountLabel();

    const {
      TREE_COVER_LOSS,
      PRODES_AMAZON,
      TREE_COVER_LOSS_ON_ARGENTINA_OTBN,
      SOY_ON_TREE_COVER_LOSS,
    } = locationsPage.diagnosticsTitles;
    let title;

    if (saTCLChecked || biomesChecked) {
      title = TREE_COVER_LOSS;
    } else if (prodesChecked || paChecked || pfChecked) {
      title = PRODES_AMAZON;
    } else if (otbnArgentinaChecked) {
      title = TREE_COVER_LOSS_ON_ARGENTINA_OTBN;
    } else {
      title = SOY_ON_TREE_COVER_LOSS;
    }

    const displayBrazilBiomeSection = this.checkBrazilBiome();
    const argentinaOtnbArea = this.isArgentinaOtnbArea();

    let informationBubbleId;
    if (prodesChecked || paChecked || pfChecked) {
      informationBubbleId = locationsPage.infoBubbleConfig.regionsProdesAnnual;
    } else if (saTCLChecked || biomesChecked) {
      informationBubbleId = locationsPage.infoBubbleConfig.regionsSaAnnual;
    } else if (otbnArgentinaChecked) {
      informationBubbleId = locationsPage.infoBubbleConfig.treeCoverLossArgOtbnYearly;
    } else {
      informationBubbleId = locationsPage.infoBubbleConfig.regionsSoyAnnual;
    }

    return (
      <div
        className={`locations-diagnostics-section ${
          regionObject.count > 0 && this.props.listView === 'forest_change' ? '' : 'hidden'
        }`}
      >
        <div className="locations-diagnostics-section-title">South America</div>

        <div className="locations-diagnostics__subsection section__south-america">
          <div className="subsection-chart">
            <div className="locations-diagnostics__subsection-container">
              <div className="locations-diagnostics__flex-center subsection-subtitle__container">
                <span className="subsection-subtitle">{title}</span>
                <IconButtonWrapper id={informationBubbleId} />
                <span
                  onClick={() => this.props.fireDownload('southAmericaTCL')}
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
              <h3 className="subsection-subtitle">Brazil Biomes Percent Overlap</h3>
              <IconButtonWrapper id={locationsPage.infoBubbleConfig.regionsSaBiomes} />
              <span
                onClick={() => this.props.fireDownload('southAmericaOverlap')}
                className="locations-diagnostics-icon-holder"
              >
                <svg className="svg-icon">
                  <use xlinkHref="#icon-download" />
                </svg>
              </span>
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
        {argentinaOtnbArea && otbnArgentinaChecked && (
          <OtbnAreaChart data={getFilteredLocations()[0]} />
        )}

        <div className="locations-diagnostics-subsection">
          <div
            className={`south-america-slider__container slider__container ${
              sliderActive ? 'slider-active' : ''
            }`}
          >
            <input id="south-american-slider" />
          </div>
        </div>
        <hr />
      </div>
    );
  }
}
