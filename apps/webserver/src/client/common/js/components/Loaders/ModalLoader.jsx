import { Component } from 'react';
import '../../../css/modal.scss';

export default class ModalLoader extends Component {
  render() {
    const { open, position, showMessage, showSpinner = true, header, message } = this.props;

    const stylePosition = position === 'absolute' ? 'absolute' : 'fixed';

    return (
      <div
        className={`modal-loader__dialog ${open ? '' : 'hidden'}`}
        style={{ position: stylePosition }}
      >
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
