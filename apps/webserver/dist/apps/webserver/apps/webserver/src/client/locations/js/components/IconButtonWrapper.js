import store from '../store';
import React, { Component } from 'react';

import IconButton from 'material-ui/IconButton';
import InfoIcon from 'material-ui/svg-icons/action/info';

import { togglePopover } from '../utils/togglePopover';

export default class IconButtonWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...store.getState(),
    };
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(this.storeDidUpdate);
    this._ismounted = true;
  }

  componentWillUnmount() {
    this._ismounted = false;
    this.unsubscribe();
  }

  storeDidUpdate = () => {
    if (this._ismounted === true) {
      this.setState(store.getState());
    }
  };

  handleIconClick = (evt) => {
    const { infoBubbleCache } = this.state;
    togglePopover(evt, infoBubbleCache);
  };

  render() {
    const {
      popover: { popoverLoading },
    } = this.state;
    const { id } = this.props;

    return (
      <IconButton
        style={{ padding: 0, width: 15, height: 15, marginLeft: '10px' }}
        iconStyle={{ padding: 0, width: 15, height: 15 }}
        className={`metadata-info-button${popoverLoading === id ? ' metadata-icon-loading' : ''}`}
        id={id}
        onClick={this.handleIconClick}
      >
        <InfoIcon color="gray" />
      </IconButton>
    );
  }
}
