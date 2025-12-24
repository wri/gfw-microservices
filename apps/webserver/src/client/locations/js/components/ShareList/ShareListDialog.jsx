import * as PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import IconButton from '../../../../common/js/components/IconButton';
import IconTimes from '../../../../common/js/components/icon/IconTimes';
import { PillButton } from '../../../../components';

const ShareListDialog = (props) => {
  return (
    <Dialog open={props.open} onClose={props.onRequestClose}>
      <DialogTitle className="dialog__header">
        {props.modalTitle && <h1 className="dialog__title">{props.modalTitle}</h1>}
        <IconButton icon={<IconTimes />} onClick={props.onRequestClose} size="large" />
      </DialogTitle>
      <DialogContent>{props.body}</DialogContent>
      <DialogActions>
        <PillButton variant="contained" onClick={props.onButtonConfirm}>
          OK
        </PillButton>
      </DialogActions>
    </Dialog>
  );
};

ShareListDialog.propTypes = {
  onRequestClose: PropTypes.func,
  onButtonConfirm: PropTypes.func,
  open: PropTypes.bool,
  body: PropTypes.any,
};

export default ShareListDialog;
