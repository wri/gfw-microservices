import ModalWrapper from './ModalWrapper';
import { showLayerInfo } from '../../actions/mapActions';
import store from '../../store';
import { mapPage } from '../../../../common/js/config';
import React, { Component } from 'react';

export default class InfoModal extends Component {
  close = () => {
    document.getElementById('modal-content-id').scrollTop = 0;
    store.dispatch(showLayerInfo({}));
  };

  render() {
    const { info } = this.props;
    const theme = info && info.download_data ? '' : 'no-download';

    return (
      <ModalWrapper onClose={this.close} theme={theme}>
        <h3 className="modal-instructions-header">{mapPage.analyzeInstructionsTitle}</h3>
        <p className="modal-instructions">{mapPage.analyzeInstructions}</p>
        <p className="modal-instructions">
          {mapPage.analyzeInstructionsTwo}
          <a href={mapPage.analyzeInstructionsLink} target="_blank">
            {mapPage.analyzeInstructionsThree}
          </a>
        </p>
      </ModalWrapper>
    );
  }
}
