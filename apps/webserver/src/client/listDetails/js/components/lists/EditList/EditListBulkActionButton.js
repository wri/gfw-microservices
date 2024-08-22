import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import MenuItem from 'material-ui/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import { userAccessLevel } from '../../../../../common/js/config';
import EditListDialog from './EditListDialog';

import './EditList.scss';

export class EditListBulkActionButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isModalOpen: false,
    };
  }

  modalClose = () => {
    this.setState({ isModalOpen: false });
  };

  modalOpen = () => {
    this.setState({ isModalOpen: true });
  };

  render() {
    const { currentUser, selectedLocations, editList } = this.props;
    const { isModalOpen } = this.state;

    return (
      <React.Fragment>
        <EditListDialog onRequestClose={this.modalClose} open={isModalOpen} />

        <div
          id="EditList"
          onClick={selectedLocations?.length === 0 ? () => this.modalOpen() : null}
        >
          <MenuItem
            primaryText="Edit"
            disabled={currentUser.access_level_id === userAccessLevel.VIEWER}
            leftIcon={<EditIcon />}
            onClick={currentUser.access_level_id === userAccessLevel.VIEWER ? null : editList}
          />
        </div>
      </React.Fragment>
    );
  }
}

EditListBulkActionButton.propTypes = {
  editList: PropTypes.func,
  currentUser: PropTypes.any,
  selectedLocations: PropTypes.any,
};
