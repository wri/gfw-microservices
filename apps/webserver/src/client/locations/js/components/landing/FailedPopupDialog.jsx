import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import * as PropTypes from 'prop-types';

import { PillButton } from '../../../../components';
import './FailedPopupDialog.scss';

export function FailedPopupDialog(props) {
  return (
    <Dialog
      open={props.open}
      onClose={props.onRequestClose}
      classes={{
        paper: 'dialog__content',
      }}
    >
      {props.title && <DialogTitle>{props.title}</DialogTitle>}
      <DialogContent className="FailedPopupDialog dialog__body">{props.message}</DialogContent>
      <DialogActions className="dialog__footer FailedPopupDialog__dialog-buttons">
        <PillButton variant="contained" onClick={props.onOkButtonPress}>
          OK
        </PillButton>
      </DialogActions>
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
