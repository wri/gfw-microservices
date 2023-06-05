import { setFireDays } from '../../actions/mapActions';
import store from '../../store';
import React, { Component } from 'react';

export default class FiresControls extends Component {
  setFiresTimeline(evt) {
    let daysPast = 7;
    switch (evt.target.id) {
      case 'past3':
        daysPast = 3;
        break;
      case 'past2':
        daysPast = 2;
        break;
      case 'past1':
        daysPast = 1;
        break;

      default:
        break;
    }
    store.dispatch(setFireDays(daysPast));
  }

  render() {
    return (
      <div className={`timeline-container fires-controls ${this.props.visible ? '' : ' hidden'}`}>
        <div
          id="past7"
          className={`fires-controls-option ${this.props.fireDays === 7 ? 'active-fires' : ' '}`}
          onClick={this.setFiresTimeline}
        >
          PAST WEEK
        </div>
        <div
          id="past3"
          className={`fires-controls-option ${this.props.fireDays === 3 ? 'active-fires' : ' '}`}
          onClick={this.setFiresTimeline}
        >
          PAST 72 HOURS
        </div>
        <div
          id="past2"
          className={`fires-controls-option ${this.props.fireDays === 2 ? 'active-fires' : ' '}`}
          onClick={this.setFiresTimeline}
        >
          PAST 48 HOURS
        </div>
        <div
          id="past1"
          className={`fires-controls-option ${this.props.fireDays === 1 ? 'active-fires' : ' '}`}
          onClick={this.setFiresTimeline}
        >
          PAST 24 HOURS
        </div>
      </div>
    );
  }
}
