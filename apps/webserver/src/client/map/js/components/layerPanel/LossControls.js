import '../../../../common/css/_irsBase.scss';
import '../../../../common/css/_irsStyle.scss';

import { mapPage } from '../../../../common/js/config';
import React, { Component } from 'react';

const lossOptions = [];

export default class LossControls extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playing: false,
      lossFromSelectIndex: 1,
      lossToSelectIndex: mapPage.treeCoverLossYearsFC.length,
    };
  }

  componentDidMount() {
    if ($('#loss-slider').ionRangeSlider) {
      const values = [];
      for (let i = this.state.lossFromSelectIndex; i <= this.state.lossToSelectIndex; i++) {
        lossOptions.push({ label: 2000 + i + '', value: i });
        values.push(i + 2000);
      }
      $('#loss-slider').ionRangeSlider({
        type: 'double',
        values: values,
        grid: true,
        grid_snap: true,
        hide_min_max: true,
        prettify_enabled: false,
        onFinish: this.sliderChanged,
        prettify: (value) => value + '%',
      });
      this.lossSlider = $('#loss-slider').data('ionRangeSlider');
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.timer);
  }

  updateIonRangeSliderLabels = (data) => {
    const { from_value, to_value } = data;
    const years = mapPage.treeCoverLossYearsFC;
    years.forEach((year) => {
      if (year > to_value || year < from_value) {
        $(`.loss-slider-container .irs-grid-text:contains("${year}")`).addClass('irs-inactive-year');
      } else {
        $(`.loss-slider-container .irs-grid-text:contains("${year}")`).removeClass('irs-inactive-year');
      }
    });
  };

  sliderChanged = (data) => {
    this.updateIonRangeSliderLabels(data);
    this.props.setLossTimeline(data.from_value, data.to_value);
  };

  render() {
    return (
      <div className={`timeline-container loss loss-slider-container${this.props.visible ? '' : ' hidden'}`}>
        <input id="loss-slider" />
      </div>
    );
  }
}
