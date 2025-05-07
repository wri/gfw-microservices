import React from 'react';
import * as PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import Button from '../../../../common/js/components/Button';
import IconButton from '../../../../common/js/components/IconButton';
import IconTimes from '../../../../common/js/components/icon/IconTimes';

const ShareListDialog = (props) => {
  return (
    <Dialog
      title={
        <div className="dialog__header">
          {props.modalTitle && <h1 className="dialog__title">{props.modalTitle}</h1>}
          <IconButton icon={<IconTimes />} onClick={() => props.onRequestClose()} size="large" />
        </div>
      }
      open={props.open}
      onRequestClose={() => props.onRequestClose()}
      actions={<Button variant="primary" onClick={() => props.onButtonConfirm()} label="OK" />}
    >
      {props.body}
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
