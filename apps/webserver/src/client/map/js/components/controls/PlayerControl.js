import { Component } from 'react';
import { scaleLinear } from 'd3-scale';
import { getUnixTime, fromUnixTime, format, isBefore, isAfter } from 'date-fns';

import '../../../../common/css/_irsBase.scss';
import '../../../../common/css/_irsStyle.scss';

const flexStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

export default class PlayerControl extends Component {
  constructor(props) {
    super(props);
    const { start, end, sliderDate } = props;
    // Create initial linear scale (for <Slider /> component)
    const scale = scaleLinear()
      .domain([getUnixTime(new Date(start)), getUnixTime(new Date(end))])
      .range([0, 1]);
    // Set Initial State
    this.state = {
      start,
      sliderDate,
      end,
      scale,
    };
  }

  componentDidMount() {
    if ($('#adhoc-slider').ionRangeSlider) {
      $('#adhoc-slider').ionRangeSlider({
        type: 'single',
        min: 0,
        max: 1,
        from: 1,
        step: 0.01,
        grid: false,
        hide_min_max: true,
        hide_from_to: true,
        onFinish: this.handleIonChange,
      });
      const slider = $('#adhoc-slider').data('ionRangeSlider');
      this.saveSlider(slider);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { start, sliderDate, end, changeSlider } = nextProps;

    const scale = scaleLinear()
      .domain([getUnixTime(new Date(start)), getUnixTime(new Date(end))])
      .range([0, 1]);

    this.setState({ start, sliderDate, end, scale }, () => {
      // If current is before start
      if (isBefore(new Date(sliderDate), new Date(start))) {
        changeSlider(null, start);
        this.updateIon(start);
      }
      // If current is after end
      if (isAfter(new Date(sliderDate), new Date(end))) {
        changeSlider(null, end);
        this.updateIon(end);
      }
    });
  }

  render() {
    const { sliderDate } = this.state;
    const formattedValue = format(new Date(sliderDate), 'd MMM yyyy');

    return (
      <div style={flexStyle}>
        <div className="slider-container player-control__irs">
          <input id="adhoc-slider" />
        </div>
        <span style={{ minWidth: '100px', paddingLeft: '20px', color: '#9bbe50' }}>
          {formattedValue}
        </span>
      </div>
    );
  }

  handleIonChange = (data) => {
    const { changeSlider } = this.props;
    const { scale } = this.state;
    const { from } = data;
    // Must derive the unix time from the value of the slider
    const currentValue = scale.invert(from);
    const currentDate = fromUnixTime(currentValue);
    // Set the new current state
    changeSlider(null, currentDate);
  };

  updateIon = (sliderDate, date) => {
    const { scale, slider } = this.state;
    const newFrom = scale(getUnixTime(new Date(date)));
    slider.update({
      from: newFrom,
    });
  };

  saveSlider = (slider) => {
    this.setState({ slider });
  };
}
