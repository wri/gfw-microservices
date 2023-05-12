import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import Button from '../../../../../common/js/components/Button';
import { userAccessLevel } from '../../../../../common/js/config';
import EditListDialog from './EditListDialog';

import './EditList.scss';

export class EditList extends Component {
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

        <div id="EditList" onClick={selectedLocations.length === 0 ? () => this.modalOpen() : null}>
          <Button
            disabled={currentUser.access_level_id === userAccessLevel.VIEWER}
            label="Edit"
            onClick={currentUser.access_level_id === userAccessLevel.VIEWER ? null : editList}
            variant="tertiary"
          />
        </div>
      </React.Fragment>
    );
  }
}

EditList.propTypes = {
  editList: PropTypes.func,
  currentUser: PropTypes.any,
  selectedLocations: PropTypes.any,
};
