import React, { Component } from 'react';

import ModalWrapper from './ModalWrapper';

import store from '../../store';
import { showBasemapInfo } from '../../actions/mapActions';

export default class BasemapModal extends Component {
  close = () => {
    document.getElementById('modal-content-id').scrollTop = 0;
    store.dispatch(showBasemapInfo(''));
  };

  render() {
    const { content } = this.props;

    return (
      <ModalWrapper onClose={this.close} modalType={'basemap-modal'}>
        <div className="basemap-modal-content" dangerouslySetInnerHTML={{ __html: content }} />
      </ModalWrapper>
    );
  }
}
