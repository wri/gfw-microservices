import React, { Component } from 'react';

import DatePickerControl from './DatePickerControl';
import MonthPickerControl from './MonthPickerControl';
import PlayerControl from './PlayerControl';
import Divider from 'material-ui/Divider';

export default class AdhocAnalysis extends Component {
  componentDidUpdate(prevProps) {
    const { changeSlider, title, end } = this.props;
    // A new layer has been loaded
    if (prevProps.title !== title) {
      changeSlider(null, end);
    }
  }

  render() {
    const { visible, title, start, sliderDate, end, changeStart, changeEnd, changeSlider } =
      this.props;

    const timeComponent =
      title === 'GLAD' || title === 'RADD' ? (
        <DatePickerControl
          title={title}
          start={start}
          end={end}
          changeStart={changeStart}
          changeEnd={changeEnd}
        />
      ) : (
        <MonthPickerControl
          title={title}
          start={start}
          end={end}
          changeStart={changeStart}
          changeEnd={changeEnd}
        />
      );

    return (
      <div className={`adhoc-analysis ${visible ? '' : 'hidden'}`}>
        {timeComponent}
        {/* <Divider style={{width: '1.5px', height: '30px'}} />
        <PlayerControl
          start={start}
          sliderDate={sliderDate}
          end={end}
          changeStart={changeStart}
          changeSlider={changeSlider}
          changeEnd={changeEnd} /> */}
      </div>
    );
  }
}
