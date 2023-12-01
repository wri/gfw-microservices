import React, { Component } from 'react';
import moment from 'moment';
import DatePicker from 'material-ui/DatePicker';

// Styling for the text field element of <DatePicker /> Component
const datePickerStyle = {
  width: '100px',
  height: '32px',
  margin: '10px 5px',
  border: '1px solid #A1BA42',
  borderRadius: '20px',
  fontSize: '13px',
  fontWeight: 300,
};
const flexStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center' };

const fontStyle = {
  fontFamily: "'Fira Sans', sans-serif !important",
};

export default class DatePickerControl extends Component {
  constructor(props) {
    super(props);
    const { start, end } = props;
    this.state = {
      start: start,
      end: end,
      minDate: start,
      maxDate: end,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { start, end } = nextProps;
    this.setState({ start, end });
  }

  render() {
    const { changeStart, changeEnd } = this.props;
    const { start, end, minDate, maxDate } = this.state;
    const fromLabel = `deforestation alerts from`;

    return (
      <div className="adhoc-analysis__date-picker-container" style={flexStyle}>
        <div style={{ ...fontStyle, fontSize: '11px' }}>{fromLabel}</div>
        <DatePicker
          minDate={minDate}
          maxDate={maxDate}
          value={start}
          container="inline"
          formatDate={this.formatDate}
          textFieldStyle={{ ...datePickerStyle, ...fontStyle }}
          onChange={(evt, date) => changeStart(null, date)}
        />
        <div style={{ ...fontStyle, fontSize: '11px' }}>to</div>
        <DatePicker
          minDate={minDate}
          maxDate={new Date()}
          value={end}
          container="inline"
          formatDate={this.formatDate}
          textFieldStyle={{ ...datePickerStyle, ...fontStyle }}
          onChange={(evt, date) => changeEnd(null, date)}
        />
      </div>
    );
  }

  formatDate = (date) => moment(date).format('D MMM YYYY');
}
