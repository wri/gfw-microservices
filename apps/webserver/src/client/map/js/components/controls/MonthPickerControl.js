import React, { Component } from 'react';
import moment from 'moment';

window.moment = moment;

const flexStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  padding: '10px',
};

export default class MonthPickerControl extends Component {
  constructor(props) {
    super(props);
    const { title, start, end } = props;
    this.state = {
      title,
      fromMonth: moment(start).month() + 1,
      fromYear: moment(start).year(),
      toMonth: moment(end).month() + 1,
      toYear: moment(end).year(),
    };
  }

  componentWillReceiveProps(nextProps) {
    const { title, start, end } = nextProps;
    this.setState({
      title,
      fromMonth: moment(start).month() + 1,
      fromYear: moment(start).year(),
      toMonth: moment(end).month() + 1,
      toYear: moment(end).year(),
    });
  }

  render() {
    const { title, fromMonth, fromYear, toMonth, toYear } = this.state;
    const fromLabel = `${title} alerts from`;

    return (
      <div style={flexStyle}>
        <span style={{ whiteSpace: 'nowrap' }}>{fromLabel}</span>
        <div className="map-monthpicker__select-container">
          <select value={fromMonth} name="from-month" ref="fromMonth" onChange={this.handleFromMonthChange}>
            {this.createMonthFromOptions()}
          </select>
          <select value={fromYear} name="from-year" ref="fromYear" onChange={this.handleFromYearChange}>
            {this.createYearFromOptions()}
          </select>
        </div>
        <span>to</span>
        <div className="map-monthpicker__select-container">
          <select value={toMonth} name="to-month" ref="toMonth" onChange={this.handleToMonthChange}>
            {this.createMonthToOptions()}
          </select>
          <select value={toYear} name="to-year" ref="toYear" onChange={this.handleToYearChange}>
            {this.createYearToOptions()}
          </select>
        </div>
      </div>
    );
  }

  handleFromMonthChange = (evt) => {
    const fromMonth = parseInt(evt.target.value);
    this.setState({ fromMonth }, () => {
      this.changeStartDate();
    });
  };

  handleFromYearChange = (evt) => {
    const fromYear = parseInt(evt.target.value);
    this.setState({ fromYear }, () => {
      this.changeStartDate();
    });
  };

  changeStartDate = () => {
    const { changeStart } = this.props;
    const { fromYear, fromMonth } = this.state;
    const newMoment = moment(`${fromYear}-${fromMonth}`, 'YYYY-M').startOf('month');
    const date = newMoment.toDate();
    changeStart(null, date);
  };

  handleToMonthChange = (evt) => {
    const toMonth = parseInt(evt.target.value);
    this.setState({ toMonth }, () => {
      this.changeEndDate();
    });
  };

  handleToYearChange = (evt) => {
    const toYear = parseInt(evt.target.value);
    this.setState({ toYear }, () => {
      this.changeEndDate();
    });
  };

  changeEndDate = () => {
    const { changeEnd } = this.props;
    const { toYear, toMonth } = this.state;
    const newMoment = moment(`${toYear}-${toMonth}`, 'YYYY-M').endOf('month');
    const date = newMoment.toDate();
    changeEnd(null, date);
  };

  createMonthFromOptions = () => {
    const { fromYear, toMonth, toYear } = this.state;
    const months = moment.monthsShort();
    return months.map((month, i) => {
      const momentStart = moment(`${fromYear}-${i + 1}`, 'YYYY-M');
      const momentEnd = moment(`${toYear}-${toMonth}`, 'YYYY-M');
      return (
        <option
          id={month + i}
          value={i + 1}
          key={i}
          disabled={momentStart.isSameOrBefore(momentEnd, 'month') ? false : true}
          className="classifications-option"
        >
          {month}
        </option>
      );
    });
  };

  createMonthToOptions = () => {
    const { fromYear, fromMonth, toYear } = this.state;
    const months = moment.monthsShort();
    const currentYear = moment().year();
    const currentMonth = moment().month() + 1;
    const momentCurrent = moment(`${currentYear}-${currentMonth}`, 'YYYY-M');
    return months.map((month, i) => {
      const momentStart = moment(`${fromYear}-${fromMonth}`, 'YYYY-M');
      const momentEnd = moment(`${toYear}-${i + 1}`, 'YYYY-M');
      return (
        <option
          id={month + i}
          value={i + 1}
          key={i}
          disabled={
            momentEnd.isSameOrAfter(momentStart, 'month') && momentEnd.isSameOrBefore(momentCurrent, 'month')
              ? false
              : true
          }
          className="classifications-option"
        >
          {month}
        </option>
      );
    });
  };

  createYearToOptions = () => {
    const { fromYear, title } = this.state;
    const startYear = title === 'FORMA' ? 2012 : 2004;
    const thisYear = moment().year();
    const numberOfOptions = thisYear - startYear + 1;
    const yearOptions = [];
    for (var i = 0; i < numberOfOptions; i++) {
      yearOptions.push(
        <option
          value={startYear + i}
          key={i}
          disabled={fromYear <= startYear + i ? false : true}
          className="classifications-option"
        >
          {startYear + i}
        </option>
      );
    }
    return yearOptions;
  };

  createYearFromOptions = () => {
    const { toYear, title } = this.state;
    const startYear = title === 'FORMA' ? 2012 : 2004;
    const thisYear = moment().year();
    const numberOfOptions = thisYear - startYear + 1;
    const yearOptions = [];
    for (var i = 0; i < numberOfOptions; i++) {
      yearOptions.push(
        <option
          value={startYear + i}
          key={i}
          disabled={toYear < startYear + i ? true : false}
          className="classifications-option"
        >
          {startYear + i}
        </option>
      );
    }
    return yearOptions;
  };
}
