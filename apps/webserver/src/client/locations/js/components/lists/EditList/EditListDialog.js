import React from 'react';
import * as PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import { IconClose } from '../../../../../common/js/components/icon/IconClose';

const EditListDialog = props => {
  return (
    <Dialog
      title={
        <div className="ModalDialog__header">
          <span>No Locations selected</span>
          <IconClose onRequestClose={props.onRequestClose} />
        </div>
      }
      open={props.open}
      onRequestClose={() => props.onRequestClose()}
      actions={
        <div className="ModalDialog__footer">
          <button
            className="gfw-button btn-green"
            onClick={() => props.onRequestClose()}
          >
            OK
          </button>
        </div>
      }
    >
      <div className="ModalDialog__body">
        <p>
          To edit locations in a list, you must first select the locations you
          wish to add
        </p>
      </div>
    </Dialog>
  );
};

EditListDialog.propTypes = {
  onRequestClose: PropTypes.func,
  open: PropTypes.bool,
  body: PropTypes.any,
};

export default EditListDialog;
