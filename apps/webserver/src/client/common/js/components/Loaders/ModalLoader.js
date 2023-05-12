import React, { Component } from 'react';
import '../../../css/modal.scss';

export default class ModalLoader extends Component {
  render() {
    const { open, size, position, showMessage, showSpinner = true, header, message } = this.props;
    const wheelSize = size || 120;
    const stylePosition = position === 'absolute' ? 'absolute' : 'fixed';

    return (
      <div className={`modal-loader__dialog ${open ? '' : 'hidden'}`} style={{ position: stylePosition }}>
        {/* <CircularProgress size={wheelSize} thickness={5} color='#97bd3d' /> */}
        {showSpinner && (
          <div className="modal-loader">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        )}
        {showMessage ? (
          <div className="modal-loader-message">
            <h2>{header}</h2>
            <p>{message}</p>
          </div>
        ) : null}
      </div>
    );
  }
}
