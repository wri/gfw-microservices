import React from 'react';
import Dialog from 'material-ui/Dialog';
import * as PropTypes from 'prop-types';
import Button from '../../../../common/js/components/Button';

import './FailedPopupDialog.scss';

export function FailedPopupDialog(props) {
  return (
    <Dialog
      title={props.title || ''}
      open={props.open}
      modal={false}
      bodyClassName="FailedPopupDialog dialog__body"
      contentClassName="dialog__content"
      onRequestClose={props.onRequestClose}
      actions={
        <div className="dialog__footer FailedPopupDialog__dialog-buttons">
          <Button
            variant="primary"
            className="FailedPopupDialog__button"
            label="OK"
            onClick={props.onOkButtonPress}
          />
        </div>
      }
    >
      {props.message}
    </Dialog>
  );
}

FailedPopupDialog.propTypes = {
  title: PropTypes.string,
  message: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  open: PropTypes.bool,
  onOkButtonPress: PropTypes.func,
  onRequestClose: PropTypes.func,
};
