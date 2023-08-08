import React, { Component } from 'react';
import Highcharts from 'highcharts';
import _range from 'lodash/range';

import IconButtonWrapper from '../IconButtonWrapper';

import { formatNum, formatPct, prettifyNum, validatePct } from '../../utils/diagnostics.utils';
import { locationsPage, latestTreeCoverLossYearSensitiveAreas } from '../../../../common/js/config';

import '../../../../common/css/_irsBase.scss';
import '../../../../common/css/_irsStyle.scss';

const START_YEAR = 2001;
const END_YEAR = latestTreeCoverLossYearSensitiveAreas; // Assembla ticket: 2057 - Update FC Diagnostic Charts and CSVs to show 2019 data
const YEARS_RANGE = _range(START_YEAR, END_YEAR + 1);

export default class SensitiveAreas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tclChecked: true,
      pfChecked: false,
      paChecked: false,
      peatChecked: false,
      iflChecked: false,
      peatEnabled: true,
      startYear: START_YEAR,
      endYear: END_YEAR,
      sliderActive: false,
    };
  }

  componentDidMount() {
    if ($('#tree-cover-percent-slider').ionRangeSlider) {
      $('#tree-cover-percent-slider').ionRangeSlider({
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
    if (this.refs.lossChart) {
      this.renderChart(this.refs.lossChart);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.view === 'diagnostics' && this.props.view !== 'diagnostics') {
      const { getFilteredLocations } = this.props;
      const indonesiaPresence = getFilteredLocations()
        .map((l) => JSON.parse(l.indonesia_presence))
        .some((l) => l === true);
      if (indonesiaPresence) {
        this.setState({
          peatEnabled: true,
        });
      } else {
        this.setState({
          peatEnabled: false,
          peatChecked: false,
        });
      }
      this.setState(
        {
          startYear: START_YEAR,
          endYear: END_YEAR,
          tclChecked: true,
          pfChecked: false,
          paChecked: false,
          peatChecked: false,
          iflChecked: false,
          peatEnabled: true,
        },
        () => {
          const slider = $('#tree-cover-percent-slider').data('ionRangeSlider');
          slider.update({
            from: 0,
            to: END_YEAR - START_YEAR,
          });
        }
      );
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { view } = this.props;
    const {
      tclChecked,
      pfChecked,
      paChecked,
      peatChecked,
      iflChecked,
      peatEnabled,
      startYear,
      endYear,
    } = this.state;

    if (
      (prevProps.view !== 'diagnostics' && view === 'diagnostics') ||
      prevState.tclChecked !== tclChecked ||
      prevState.pfChecked !== pfChecked ||
      prevState.paChecked !== paChecked ||
      (prevState.peatChecked !== peatChecked && peatEnabled) ||
      prevState.iflChecked !== iflChecked ||
      prevState.startYear !== startYear ||
      prevState.endYear !== endYear
    ) {
      this.renderChart(this.refs.lossChart);
    }

    // If all of check boxes are turned off, turn on TCL by default
    if (!tclChecked && !pfChecked && !paChecked && !peatChecked && !iflChecked) {
      this.setState({ tclChecked: true });
    }
  }

  updateIonRangeSliderLabels = (data) => {
    const { from_value, to_value } = data;
    YEARS_RANGE.forEach((year) => {
      if (year > to_value || year < from_value) {
        $(`.sensitive-area-slider__container .irs-grid-text:contains("${year}")`).addClass(
          'irs-inactive-year'
        );
      } else {
        $(`.sensitive-area-slider__container .irs-grid-text:contains("${year}")`).removeClass(
          'irs-inactive-year'
        );
      }
    });
  };

  changeCanopyDensity = (data) => {
    this.updateIonRangeSliderLabels(data);
    this.setState({
      startYear: data.from_value,
      endYear: data.to_value,
      sliderActive: false,
    });
    gtag('event', 'timeslider update', {
      event_category: 'Diagnostics Click',
      event_label: 'user updated the sensitive areas timeslider',
    });
  };

  sliderChanging = () => {
    if (this.state.sliderActive === false) {
      this.setState({
        sliderActive: true,
      });
    }
  };

  updateTCL = () => {
    this.setState({
      tclChecked: !this.state.tclChecked,
    });
    gtag('event', 'Sensitive areas checkbox clicked', {
      event_category: 'Forest Change Diagnostics Click',
      event_label: 'user checked tree cover loss',
    });
  };

  updatePF = () => {
    this.setState({
      pfChecked: !this.state.pfChecked,
      paChecked: false,
      peatChecked: false,
      iflChecked: false,
    });
    gtag('event', 'Sensitive areas checkbox clicked', {
      event_category: 'Forest Change Diagnostics Click',
      event_label: 'user checked primary forest',
    });
  };

  updatePA = () => {
    this.setState({
      paChecked: !this.state.paChecked,
      pfChecked: false,
      peatChecked: false,
      iflChecked: false,
    });
    gtag('event', 'Sensitive areas checkbox clicked', {
      event_category: 'Forest Change Diagnostics Click',
      event_label: 'user checked protected areas',
    });
  };

  updatePeat = () => {
    if (this.state.peatEnabled) {
      this.setState({
        peatChecked: !this.state.peatChecked,
        pfChecked: false,
        paChecked: false,
        iflChecked: false,
      });
    }
    gtag('event', 'Sensitive areas checkbox clicked', {
      event_category: 'Forest Change Diagnostics Click',
      event_label: 'user checked peat',
    });
  };

  updateIFL = () => {
    this.setState({
      iflChecked: !this.state.iflChecked,
      pfChecked: false,
      paChecked: false,
      peatChecked: false,
    });
    gtag('event', 'Sensitive areas checkbox clicked', {
      event_category: 'Forest Change Diagnostics Click',
      event_label: 'user checked intact forest landscape',
    });
  };

  processTotals = () => {
    const { parseYearlyData } = this.props;
    const { startYear, endYear } = this.state;
    return {
      totalTCL: parseYearlyData('tree_cover_loss_total_yearly', startYear, endYear),
      totalTCLonPF: parseYearlyData('tree_cover_loss_primary_forest_yearly', startYear, endYear),
      totalTCLonPA: parseYearlyData('tree_cover_loss_protected_areas_yearly', startYear, endYear),
      totalTCLonPeat: parseYearlyData('tree_cover_loss_peat_yearly', startYear, endYear),
      totalTCLonIFL: parseYearlyData('tree_cover_loss_intact_forest_yearly', startYear, endYear),
    };
  };

  processPercents = () => {
    const { parseTotals } = this.props;
    return {
      totalExt: parseTotals('tree_cover_extent_total'),
      totalExtPF: parseTotals('tree_cover_extent_primary_forest'),
      totalExtPA: parseTotals('tree_cover_extent_protected_areas'),
      totalExtPeat: parseTotals('tree_cover_extent_peat'),
      totalExtIFL: parseTotals('tree_cover_extent_intact_forest'),
    };
  };

  renderPercentages = (totals, percents) => {
    let label, percent, lossValue;

    const treeCoverPercent = (totals.totalTCL / percents.totalExt) * 100;
    const pfPercent = (totals.totalTCLonPF / percents.totalExtPF) * 100;
    const paPercent = (totals.totalTCLonPA / percents.totalExtPA) * 100;
    const peatPercent = (totals.totalTCLonPeat / percents.totalExtPeat) * 100;
    const iflPercent = (totals.totalTCLonIFL / percents.totalExtIFL) * 100;
    const totalRows = Object.keys(percents).map((extent) => {
      switch (extent) {
        case 'totalExt':
          label = 'Tree Cover Loss';
          percent = treeCoverPercent;
          lossValue = totals.totalTCL;
          break;
        case 'totalExtPF':
          label = 'Primary Forest';
          percent = pfPercent;
          lossValue = totals.totalTCLonPF;
          break;
        case 'totalExtPA':
          label = 'Protected Areas';
          percent = paPercent;
          lossValue = totals.totalTCLonPA;
          break;
        case 'totalExtPeat':
          label = 'Peat';
          percent = peatPercent;
          lossValue = totals.totalTCLonPeat;
          break;
        case 'totalExtIFL':
          label = 'Intact Forest Landscape';
          percent = iflPercent;
          lossValue = totals.totalTCLonIFL;
          break;
      }

      percent = validatePct(percent);

      return (
        <tr key={`${extent}`} className="locations-diagnostics-table__row child">
          <td>{label}</td>
          <th className={`sensitive-areas-bar__text ${percent > 0 ? '#262626' : 'black'}`}>
            {extent === 'totalExtPeat' && !this.state.peatEnabled ? '--' : formatPct(percent) + '%'}
          </th>
          <td>
            <div className="sensitive-areas-bar__container">
              <div className="sensitive-areas-bar__data" style={{ width: `${percent}%` }} />
            </div>
          </td>
          <td className="center">
            {extent === 'totalExtPeat' && !this.state.peatEnabled
              ? '--'
              : prettifyNum(formatNum(lossValue))}
          </td>
          <td className="right">
            {extent === 'totalExtPeat' && !this.state.peatEnabled
              ? '--'
              : prettifyNum(formatNum(percents[extent]))}
          </td>
        </tr>
      );
    });

    return totalRows;
  };

  renderChart = (el) => {
    const { getYearlyData, getYearlyHighchartSeries } = this.props;
    const {
      startYear,
      endYear,
      tclChecked,
      pfChecked,
      paChecked,
      peatChecked,
      peatEnabled,
      iflChecked,
    } = this.state;
    const series = [];

    if (tclChecked) {
      series.push({
        name: 'Tree Cover Loss',
        stack: 'Tree Cover Loss',
        data: getYearlyHighchartSeries(
          getYearlyData('tree_cover_loss_total_yearly', startYear, endYear)
        ),
        color: '#ef669a',
        groupPadding: 0,
        showInLegend: false,
      });
    }

    if (pfChecked) {
      series.push({
        name: 'Primary Forest',
        stack: 'Primary Forest',
        data: getYearlyHighchartSeries(
          getYearlyData('tree_cover_loss_primary_forest_yearly', startYear, endYear)
        ),
        color: '#686868',
        groupPadding: 0,
        showInLegend: false,
      });
    }

    if (paChecked) {
      series.push({
        name: 'Protected Areas',
        stack: 'Protected Areas',
        data: getYearlyHighchartSeries(
          getYearlyData('tree_cover_loss_protected_areas_yearly', startYear, endYear)
        ),
        color: '#686868',
        groupPadding: 0,
        showInLegend: false,
      });
    }

    if (peatChecked && peatEnabled) {
      series.push({
        name: 'Peat',
        stack: 'Peat',
        data: getYearlyHighchartSeries(
          getYearlyData('tree_cover_loss_peat_yearly', startYear, endYear)
        ),
        color: '#686868',
        groupPadding: 0,
        showInLegend: false,
      });
    }

    if (iflChecked) {
      series.push({
        name: 'Intact Forest Landscape',
        stack: 'Intact Forest Landscape',
        data: getYearlyHighchartSeries(
          getYearlyData('tree_cover_loss_intact_forest_yearly', startYear, endYear)
        ),
        color: '#686868',
        groupPadding: 0,
        showInLegend: false,
      });
    }

    const chart = new Highcharts.chart({
      chart: {
        renderTo: el,
        type: 'column',
        className: 'sensitive-areas-chart',
      },
      title: {
        text: '',
      },
      xAxis: {
        type: 'category',
        crosshair: true,
        title: {
          useHTML: true,
          text: '<div class="SensitiveAreas__hc-xAxis--title">Years</div>',
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
          text: '<div class="SensitiveAreas__hc-yAxis--title" style="width: 300px; text-align: center;">Forest Loss (ha)</div>',
        },
      },
      tooltip: {
        headerFormat: '<table>',
        pointFormatter: function () {
          return `<tr><td style="color:${this.color};padding:0">${
            this.series.name
          }: </td><td style="padding-top:0; padding-bottom: 0"><b>${prettifyNum(
            formatNum(this.y)
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
      series: series,
      credits: {
        enabled: false,
      },
    });

    return chart;
  };

  renderTotals = (totals) => {
    const { primaryForest, protectedArea, peat, ifl } = this.props;
    let checked,
      onChange,
      label,
      dataCy,
      percent,
      disabled = false;

    const pfPercent = (totals.totalTCLonPF / totals.totalTCL) * 100;
    const paPercent = (totals.totalTCLonPA / totals.totalTCL) * 100;
    const peatPercent = (totals.totalTCLonPeat / totals.totalTCL) * 100;
    const iflPercent = (totals.totalTCLonIFL / totals.totalTCL) * 100;

    const totalRows = Object.keys(totals).map((tote) => {
      switch (tote) {
        case 'totalTCL':
          checked = this.state.tclChecked;
          onChange = this.updateTCL;
          label = 'Tree Cover Loss';
          dataCy = 'tree-cover-loss';
          break;
        case 'totalTCLonPF':
          checked = this.state.pfChecked;
          onChange = this.updatePF;
          label = 'Primary Forest';
          dataCy = 'primary-forest';
          percent = pfPercent;
          if (primaryForest > 0) {
            disabled = false;
          } else if (totals.totalTCLonPF > 0) {
            disabled = false;
          } else {
            disabled = true;
          }
          break;
        case 'totalTCLonPA':
          checked = this.state.paChecked;
          onChange = this.updatePA;
          label = 'Protected Areas';
          dataCy = 'protected-areas';
          percent = paPercent;
          if (protectedArea > 0) {
            disabled = false;
          } else if (totals.totalTCLonPA > 0) {
            disabled = false;
          } else {
            disabled = true;
          }
          break;
        case 'totalTCLonPeat':
          checked = this.state.peatChecked;
          onChange = this.updatePeat;
          label = 'Peat';
          dataCy = 'peat';
          percent = peatPercent;
          if (peat > 0) {
            disabled = false;
          } else if (totals.totalTCLonPeat > 0) {
            disabled = false;
          } else {
            disabled = true;
          }
          break;
        case 'totalTCLonIFL':
          checked = this.state.iflChecked;
          onChange = this.updateIFL;
          label = 'Intact Forest Landscape';
          dataCy = 'intact-forest-landscape';
          percent = iflPercent;
          if (ifl > 0) {
            disabled = false;
          } else if (totals.totalTCLonIFL > 0) {
            disabled = false;
          } else {
            disabled = true;
          }
          break;
      }
      percent = validatePct(percent);
      return (
        <tr
          key={`sensitive-${tote}`}
          className={`locations-diagnostics-table__row ${tote === 'totalTCL' ? 'parent' : 'child'}`}
        >
          <td className={`locations-diagnostics-table__column ${tote === 'totalTCL' ? '' : ''}`}>
            <input
              type="checkbox"
              id={`sensitive-${tote}-check`}
              className={tote === 'totalTCL' ? 'pink' : 'grey'}
              checked={checked}
              onChange={onChange}
              disabled={(tote === 'totalTCLonPeat' && !this.state.peatEnabled) || disabled}
            />
            <label
              data-cy={dataCy}
              htmlFor={`sensitive-${tote}-check`}
              className={`legend-square-label ${
                (tote === 'totalTCLonPeat' && !this.state.peatEnabled) || disabled
                  ? 'peat-disabled'
                  : ''
              }`}
            >
              {label}
            </label>
          </td>
          <td className="locations-diagnostics-table__column right">
            {(tote === 'totalTCLonPeat' && !this.state.peatEnabled) || disabled
              ? '--'
              : prettifyNum(formatNum(totals[tote]))}
          </td>
          <td className="locations-diagnostics-table__column right">
            {tote === 'totalTCL'
              ? null
              : (tote === 'totalTCLonPeat' && !this.state.peatEnabled) || disabled
              ? '--'
              : formatPct(percent) + '%'}
          </td>
        </tr>
      );
    });

    return totalRows;
  };

  render() {
    const totals = this.processTotals();
    const percentages = this.processPercents();
    const totalsTable = this.renderTotals(totals);
    const percentagesTable = this.renderPercentages(totals, percentages);

    const { startYear, endYear, sliderActive } = this.state;

    let lossLabel = <span key="SensitiveAreasLossLabel__default">Loss, all years (ha)</span>;
    if (startYear === endYear) {
      lossLabel = <span key="SensitiveAreasLossLabel__same-years">Loss, ({startYear}) (ha)</span>;
    } else if (startYear !== START_YEAR || endYear !== END_YEAR) {
      lossLabel = (
        <span key="SensitiveAreasLossLabel__different-years">
          Loss, {`${startYear} - ${endYear}`} (ha)
        </span>
      );
    }

    let lossTableLabel = (
      <span key="SensitiveAreasLossTableLabel__default">Loss, all years (ha)</span>
    );
    if (startYear === endYear) {
      lossTableLabel = (
        <span key="SensitiveAreasLossTableLabel__same-years">Loss, {startYear} (ha)</span>
      );
    } else if (startYear !== START_YEAR || endYear !== END_YEAR) {
      lossTableLabel = (
        <span key="SensitiveAreasLossTableLabel__different-years">
          Loss, {`${startYear}-${endYear}`} (ha)
        </span>
      );
    }

    return (
      <div
        className={`locations-diagnostics-section ${
          this.props.listView === 'forest_change' ? '' : 'hidden'
        }`}
      >
        <h2 className="locations-diagnostics__subtitle">Sensitive Areas</h2>

        <div className="locations-diagnostics__subsection section__loss-of-forests">
          <div className="subsection-chart">
            <div className="locations-diagnostics__flex-center subsection-subtitle__container">
              <h3 className="locations-diagnostics-subsection-title">Loss of Forests</h3>
              <IconButtonWrapper id={locationsPage.infoBubbleConfig.saLossOfForests} />
              <span
                onClick={() => this.props.fireDownload('forestLoss')}
                className="locations-diagnostics-icon-holder"
              >
                <svg className="svg-icon">
                  <use xlinkHref="#icon-download" />
                </svg>
              </span>
            </div>
            <p className="locations-instructional__text">
              Select one main category and/or sub-category to adjust the graph and table.
            </p>
            <div className="chart-container">
              <div ref="lossChart" />
            </div>
          </div>

          <div className="locations-diagnostics-table">
            <table>
              <thead>
                <tr>
                  <th />
                  <th className="label loss-label right">
                    {lossTableLabel}
                    <IconButtonWrapper id={locationsPage.infoBubbleConfig.lossAllYears} />
                  </th>
                  <th className="label percent-loss right">
                    <span className="percent-loss__label">% of TCL</span>
                  </th>
                </tr>
              </thead>
              <tbody>{totalsTable}</tbody>
            </table>
          </div>
        </div>

        <div className="locations-diagnostics__subsection subsection-historic-area">
          <div className="table__historic-area">
            <table>
              <thead>
                <tr className="historic-area__title-row">
                  <th className="historic-area__title-container" colSpan={3}>
                    <div className="historic-area__title">
                      <h3 className="locations-diagnostics-subsection-title">
                        Percentage of Historic Area Lost
                      </h3>
                      <IconButtonWrapper id={locationsPage.infoBubbleConfig.saHistoricAreasLoss} />
                      <span
                        onClick={() => this.props.fireDownload('historicPercent')}
                        className="locations-diagnostics-icon-holder"
                      >
                        <svg className="svg-icon">
                          <use xlinkHref="#icon-download" />
                        </svg>
                      </span>
                    </div>
                    <p className="locations-instructional__text">
                      Change years displayed in the graphs above and start and end dates for total
                      loss calculations in the tables at right.
                    </p>
                  </th>
                  <th className="label left">{lossLabel}</th>
                  <th className="label left">
                    TREE COVER EXTENT <span className="word-break">2000 (ha)</span>
                  </th>
                </tr>
              </thead>
              <tbody>{percentagesTable}</tbody>
            </table>
          </div>
        </div>
        <div className="locations-diagnostics-subsection">
          <div
            className={`sensitive-area-slider__container slider__container ${
              sliderActive ? 'slider-active' : ''
            }`}
          >
            <input id="tree-cover-percent-slider" />
          </div>
        </div>
        <hr />
      </div>
    );
  }
}
