import React, { Component } from 'react';

import '../../../../common/css/_irsBase.scss';
import '../../../../common/css/_irsStyle.scss';

import { mapPage } from '../../../../common/js/config';
const { prodesLossYears } = mapPage;

export default class ProdesControls extends Component {
  componentDidMount() {
    if ($('#prodes-slider').ionRangeSlider) {
      $('#prodes-slider').ionRangeSlider({
        type: 'double',
        values: prodesLossYears,
        grid: true,
        grid_snap: true,
        hide_min_max: true,
        prettify_enabled: false,
        onFinish: this.sliderChanged,
        prettify: (value) => value + '%',
      });
      this.lossSlider = $('#prodes-slider').data('ionRangeSlider');
    }
  }

  updateIonRangeSliderLabels = (data) => {
    const { from_value, to_value } = data;
    prodesLossYears.forEach((year) => {
      if (year > to_value || year < from_value) {
        $(`.prodes-slider-container .irs-grid-text:contains("${year}")`).addClass(
          'irs-inactive-year'
        );
      } else {
        $(`.prodes-slider-container .irs-grid-text:contains("${year}")`).removeClass(
          'irs-inactive-year'
        );
      }
    });
  };

  sliderChanged = (data) => {
    this.updateIonRangeSliderLabels(data);
    this.props.setProdesTimeline(data.from_value, data.to_value);
  };

  render() {
    return (
      <div
        className={`timeline-container loss prodes-slider-container ${
          this.props.visible ? '' : 'hidden'
        }`}
      >
        <div className="slider-tooltip" ref="sliderTooltip" />
        <input id="prodes-slider" />
      </div>
    );
  }
}
