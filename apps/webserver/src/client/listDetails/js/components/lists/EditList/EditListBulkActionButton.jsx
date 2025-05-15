import { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Button } from '@mui/material';
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
      <>
        <EditListDialog onRequestClose={this.modalClose} open={isModalOpen} />

        <div
          id="EditList"
          onClick={selectedLocations?.length === 0 ? () => this.modalOpen() : null}
        >
          <Button
            startIcon={<EditIcon height="14px" />}
            variant="primary"
            disabled={currentUser.access_level_id === userAccessLevel.VIEWER}
            onClick={currentUser.access_level_id === userAccessLevel.VIEWER ? null : editList}
          >
            Edit
          </Button>
        </div>
      </>
    );
  }
}

EditListBulkActionButton.propTypes = {
  editList: PropTypes.func,
  currentUser: PropTypes.any,
  selectedLocations: PropTypes.any,
};
