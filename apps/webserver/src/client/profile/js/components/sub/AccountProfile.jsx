import React, { Component } from 'react';
import Select from 'react-select';
import Dialog from 'material-ui/Dialog';
import Button from '../../../../common/js/components/Button';
import LinkButton from '../../../../common/js/components/LinkButton';
import GfwSelect from '../../../../common/js/components/GfwSelect';
import { profilePage } from '../../../../common/js/config';
import { fieldValidations } from '../../utils/validations';

export default class AccountProfile extends Component {
  ovewrite = false;

  constructor(props) {
    super(props);
    const { currentUser } = props;
    const classifications = this.props.currentAccount.classification_ids.split(',').map((classification) => {
      const classId = parseInt(classification);
      const data = this.props.classificationsData.find((d) => d.id === classId);
      return data ? { label: data.classification_name, value: classId } : { label: '', value: classId };
    });

    const userStatusData = profilePage.userProfile.statusOptions;
    const status_id = currentUser.status_id ? currentUser.status_id : 1;

    const dropdownUserStatusOptions = (userStatusData) => {
      return userStatusData.map((data) => {
        return {
          value: data.id,
          label: data.name,
        };
      });
    };

    const userStatusOptions = dropdownUserStatusOptions(userStatusData);

    const getInitialUserStatusOption = (userStatusOptions, status_id) => {
      return userStatusOptions.filter((option) => {
        if (option.value === parseInt(status_id)) {
          return option;
        }
      })[0];
    };

    this.state = {
      id: 1,
      organization_address: this.props.currentAccount.organization_address
        ? this.props.currentAccount.organization_address
        : '',
      organization_is_subsidiary: this.props.currentAccount.organization_is_subsidiary
        ? this.props.currentAccount.organization_is_subsidiary
        : false,
      organization_name: this.props.currentAccount.organization_name ? this.props.currentAccount.organization_name : '',
      organization_parent: this.props.currentAccount.organization_parent
        ? this.props.currentAccount.organization_parent
        : '',
      organization_website: this.props.currentAccount.organization_website
        ? this.props.currentAccount.organization_website
        : '',
      organization_status_id: this.props.currentAccount.organization_status_id,
      policyList: this.props.policyList,
      policyUploadList: [],
      policyNames: [],
      policySelectedList: [],
      classifications,
      overwrite: false,
      dialogOpen: false,
      dialogFileOpen: false,
      dialogTitle: '',
      dialogMessage: '',
      status_id: status_id,
      dropdownUserStatusOptions: userStatusOptions,
      selectedDropdownUserStatusOption: getInitialUserStatusOption(userStatusOptions, status_id),
      updating: false,
      updatingPolicy: false,
    };
  }

  classChange = (results) => {
    this.setState({ classifications: results });
  };

  updateName = (evt) => {
    this.setState({ organization_name: evt.target.value });
  };

  updateAddress = (evt) => {
    this.setState({ organization_address: evt.target.value });
  };

  updateParent = (evt) => {
    this.setState({ organization_parent: evt.target.value });
  };

  updateWebsite = (evt) => {
    this.setState({ organization_website: evt.target.value });
  };

  updateSubsidary = (evt) => {
    this.setState({
      organization_is_subsidiary: evt.target.checked,
    });
  };

  createClassOptions = (option) => {
    return { label: option.classification_name, value: option.id };
  };

  createPolicyOptions = (option) => {
    return { label: option.document_name, value: option.document_name };
  };

  changePassword = () => {
    window.location.href = '/changeExist';
  };

  updateAccount = () => {
    const errors = [];
    const missing = [];

    fieldValidations.organization_name.validations.forEach((validation) => {
      if (validation(this.state.organization_name.trim()) === false) {
        errors.push(fieldValidations.organization_name.text);
      }
    });
    fieldValidations.organization_name.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(this.state.organization_name.trim()) === false) {
        missing.push(fieldValidations.organization_name.text);
      }
    });

    if (this.state.organization_is_subsidiary && this.state.organization_parent.trim().length === 0) {
      errors.push('You must provide a parent organization if your organization is a subsidy.');
    }
    if (!this.state.organization_is_subsidiary && this.state.organization_parent.trim().length !== 0) {
      errors.push('You must check the subsidiary box if a parent organization is supplied.');
    }

    fieldValidations.organization_address.validations.forEach((validation) => {
      if (validation(this.state.organization_address.trim()) === false) {
        errors.push(fieldValidations.organization_address.text);
      }
    });
    fieldValidations.organization_address.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(this.state.organization_address.trim()) === false) {
        missing.push(fieldValidations.organization_address.text);
      }
    });

    fieldValidations.organization_website.validations.forEach((validation) => {
      if (validation(this.state.organization_website.trim()) === false) {
        errors.push(fieldValidations.organization_website.text);
      }
    });
    fieldValidations.organization_website.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(this.state.organization_website.trim()) === false) {
        missing.push(fieldValidations.organization_website.text);
      }
    });

    if (errors.length === 0 && missing.length === 0) {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Updating account...',
        dialogMessage: '',
        updating: true,
      });
      const xmlhttp = new XMLHttpRequest();
      xmlhttp.open('POST', '/profile/updateAccount');
      xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          const res = JSON.parse(xmlhttp.responseText);
          if (res.policyResult.length === 1) {
            this.setState({
              dialogFileOpen: true,
              dialogTitle: 'Existing File!',
              dialogMessage: 'File already exists - confirm overwrite',
              updating: false,
            });
          } else if (res.policyResult.length > 1) {
            this.setState({
              dialogFileOpen: true,
              dialogTitle: 'Existing Files!',
              dialogMessage: 'Files already exist - confirm overwrite',
              updating: false,
            });
          } else if (res.redirect) {
            this.overwrite = false;
            window.location = res.redirect;
          } else {
            this.setState({
              dialogOpen: true,
              dialogTitle: 'Cannot update user!',
              dialogMessage: 'Failed to update user',
              updating: false,
            });
          }
        }
      };
      xmlhttp.setRequestHeader('Content-Type', 'application/json');
      xmlhttp.send(
        JSON.stringify({
          org_name: this.state.organization_name,
          org_address: this.state.organization_address,
          org_website: this.state.organization_website,
          parent_org_name: this.state.organization_parent,
          is_subsidiary: this.state.organization_is_subsidiary,
          arr_org_classification_ids: this.state.classifications.map((c) => c.value),
          policyUploadList: this.state.policyUploadList,
          policyNames: this.state.policyNames,
          overwrite: this.overwrite,
        })
      );
    } else {
      if (errors.length > 0 && missing.length > 0) {
        errors.unshift('Please review for invalid characters:');
        missing.unshift('Please enter:');
        const errorsAndMissing = [...errors, ...missing];
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Invalid field entries & Mandatory fields missing',
          dialogMessage: errorsAndMissing,
          updating: false,
        });
      } else if (errors.length > 0) {
        errors.unshift('Please review for invalid characters:');
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Invalid field entries',
          dialogMessage: errors,
          updating: false,
        });
      } else {
        missing.unshift('Please enter:');
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Mandatory fields missing',
          dialogMessage: missing,
          updating: false,
        });
      }
    }
  };

  updatePolicySelectedList = (results) => {
    this.setState({ policySelectedList: results });
  };

  deletePolicies = () => {
    if (this.state.policySelectedList.length === 0) {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'No files selected!',
        dialogMessage: 'No policy files to delete are selected. Please select one.',
        updating: false,
      });
    } else {
      const request = new XMLHttpRequest();
      request.onload = () => {
        if (request.responseText === 'Success') {
          window.location.reload();
        } else {
          this.setState({
            dialogOpen: true,
            dialogTitle: 'Error',
            dialogMessage: 'Deleting policies did not work!',
            updating: false,
          });
        }
      };
      request.onerror = (err) => {
        console.log(`Error: ${err}`);
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Failure',
          dialogMessage: 'Something internal failed',
          updating: false,
        });
      };
      request.open('POST', '/profile/deletePolicy', true);
      request.setRequestHeader('Content-type', 'application/json');
      request.send(
        JSON.stringify({
          policySelectedList: this.state.policySelectedList.map((p) => p.value),
        })
      );
    }
  };

  downloadPolicies = () => {
    const errors = [];
    let errorTitle = '';
    if (this.state.policySelectedList.length > 1) {
      errors.push('Too many files. Please select one.');
      errorTitle = 'Multiples files!';
    } else if (this.state.policySelectedList.length === 0) {
      errors.push('No policy files are selected. Please select one.');
      errorTitle = 'No files selected!';
    }
    this.checkDownloadPolicies(errors, errorTitle);
  };

  checkDownloadPolicies = (errors, errorTitle) => {
    if (errors.length === 0 && errorTitle === '') {
      this.setState({
        updatingPolicy: true,
      });
      window.location.href = '/profile/downloadPolicy/' + this.state.policySelectedList[0].value;
    } else {
      this.setState({
        dialogOpen: true,
        dialogTitle: errorTitle,
        dialogMessage: errors,
        updatingPolicy: false,
      });
    }
  };

  updatePolicy = (evt) => {
    const policyList = [];
    const policyNameList = [];
    for (const key of Object.keys(evt.target.files)) {
      policyNameList.push(evt.target.files[key].name);
      const reader = new FileReader();
      reader.readAsDataURL(evt.target.files[key]);
      reader.onload = function () {
        policyList.push(reader.result.match(/base64,(.*)/)[1] ? reader.result.match(/base64,(.*)/)[1] : '');
      };
      reader.onerror = function (error) {
        console.log('Error: ', error);
      };
    }
    this.setState({
      policyUploadList: policyList,
      policyNames: policyNameList,
    });
  };

  shouldCloseDialog = () => {
    this.setState({ dialogOpen: false, dialogFileOpen: false });
  };

  generateMessages = (message, i) => {
    return <p key={message + i}>{message}</p>;
  };

  shouldOverwrite = () => {
    this.overwrite = true;
    this.updateAccount();
  };

  handleDropdownUserStatusSelection = (evt) => {
    const selectedDropdownUserStatusOption = this.state.dropdownUserStatusOptions.filter((option) => {
      if (option.value === parseInt(evt.value)) {
        return option.label;
      }
    })[0];
    this.setState({
      selectedDropdownUserStatusOption: selectedDropdownUserStatusOption,
      status_id: parseInt(evt.value),
    });
  };

  render() {
    const { dialogOpen, dialogFileOpen, dialogTitle, dialogMessage, updating, updatingPolicy } = this.state;
    const action = this.shouldCloseDialog;
    const actionOverwrite = this.shouldOverwrite;
    const dialogContent = typeof dialogMessage === 'string' ? dialogMessage : dialogMessage.map(this.generateMessages);
    const defaultFileAction = updatingPolicy
      ? []
      : [
          <div className="button-container">
            <Button
              variant="primary"
              className="overwrite-button"
              label="Overwrite"
              keyboardFocused
              onClick={actionOverwrite}
            />
            <LinkButton label="Cancel" onClick={action} />
          </div>,
        ];
    const defaultAction = updating
      ? []
      : [
          <div>
            <Button variant="primary" label="Ok" keyboardFocused onClick={action} />
          </div>,
        ];
    const options = this.props.classificationsData.map(this.createClassOptions);
    const policyOptions = this.props.policyList.map(this.createPolicyOptions);
    return (
      <div>
        <Dialog
          paperClassName="dialog-paper"
          open={dialogOpen}
          title={dialogTitle}
          actions={defaultAction}
          onRequestClose={action}
        >
          {dialogContent}
        </Dialog>
        <Dialog
          paperClassName="dialog-paper"
          open={dialogFileOpen}
          title={dialogTitle}
          actions={defaultFileAction}
          onRequestClose={action}
        >
          {dialogMessage}
        </Dialog>

        <section className="section-container">
          <div className="profile-page__section">
            <div className="profile-page__multiple-inputs">
              <div className="input-field__block-container">
                <label htmlFor="organization" className="block-label required-param">
                  {profilePage.profileManager.accountProfileFields[0]}
                </label>
                <input
                  value={this.state.organization_name}
                  required
                  id="organization"
                  readOnly
                  name="organization_name"
                  onChange={this.updateName}
                />
              </div>

              <div id="subsidiary-input-container" className="input-field__block-container">
                <input
                  id="isSubsidiary"
                  checked={this.state.organization_is_subsidiary}
                  name="is_subsidiary"
                  type="checkbox"
                  style={{ width: '50px' }}
                  onChange={this.updateSubsidary}
                />
                <label htmlFor="isSubsidiary" className="profile-label">
                  {profilePage.profileManager.accountProfileFields[1]}
                </label>
              </div>
            </div>

            <div className="input-field__block-container">
              <label htmlFor="organization_address" className="block-label required-param">
                {profilePage.profileManager.accountProfileFields[2]}
              </label>
              <input
                value={this.state.organization_address}
                required
                id="organization_address"
                name="organization_address"
                onChange={this.updateAddress}
              />
            </div>

            <div className="input-field__block-container">
              <label htmlFor="organization_website" className="block-label required-param">
                {profilePage.profileManager.accountProfileFields[3]}
              </label>
              <input
                value={this.state.organization_website}
                required
                name="organization_website"
                id="organization_website"
                onChange={this.updateWebsite}
              />
            </div>

            <div className="input-field__block-container">
              <label htmlFor="organization_parent" className="block-label">
                {profilePage.profileManager.accountProfileFields[4]}
              </label>
              <input
                value={this.state.organization_parent}
                required={this.state.organization_is_subsidiary === true}
                name="organization_parent"
                id="organization_parent"
                onChange={this.updateParent}
              />
            </div>

            <div className="input-field__block-container">
              <label className="block-label">{profilePage.profileManager.accountProfileFields[5]}</label>
              <span className="profile-label profile-label-organization-policy">
                {profilePage.profileManager.policyPrompt}
              </span>
              <form method="post" encType="multipart/form-data">
                <div className="upload-policy-container">
                  <label htmlFor="uploadPolicy" className="gfw-button btn-green btn-width-12rem">
                    {profilePage.profileManager.policyUpload}{' '}
                    <span>{`${
                      this.state.policyNames.length === 0
                        ? ''
                        : this.state.policyNames.length === 1
                        ? ': 1 document'
                        : `: ${this.state.policyNames.length} documents`
                    }`}</span>
                    <input
                      id="uploadPolicy"
                      name="org_policy"
                      type="file"
                      onChange={this.updatePolicy}
                      className="hidden"
                      multiple
                    />
                  </label>
                </div>
                <Select
                  options={policyOptions}
                  placeholder={profilePage.profileManager.multiselectPrompt}
                  required
                  name="account_id"
                  id="account_classifications"
                  onChange={this.updatePolicySelectedList}
                  value={this.state.policySelectedList}
                  isMulti
                  isSearchable
                  maxMenuHeight={150}
                />
                <div className="policies-delete-download">
                  <Button
                    variant="danger"
                    onClick={this.deletePolicies}
                    label={profilePage.profileManager.policyDelete}
                  />
                  <Button onClick={this.downloadPolicies} label={profilePage.profileManager.policyDownload} />
                </div>
              </form>
            </div>

            <div className="input-field__block-container">
              <label htmlFor="account_classifications" className="block-label required-param">
                {profilePage.profileManager.accountProfileFields[6]}
              </label>
              <Select
                options={options}
                placeholder={profilePage.profileManager.multiselectPrompt}
                required
                name="account_id"
                id="account_classifications"
                onChange={this.classChange}
                value={this.state.classifications}
                isMulti
                isSearchable
                maxMenuHeight={150}
              />
            </div>

            <div className="input-field__block-container">
              <label htmlFor="user-title-id" className="block-label">
                {profilePage.profileManager.accountProfileFields[7]}
              </label>
              <GfwSelect
                value={this.state.selectedDropdownUserStatusOption}
                options={this.state.dropdownUserStatusOptions}
                onChange={(evt) => this.handleDropdownUserStatusSelection(evt)}
                id="user-title-id"
                required
                disabled
              />
            </div>
          </div>
        </section>
        <div className="profile-button-container">
          <Button variant="primary" onClick={this.updateAccount} label="Save changes" />
        </div>
      </div>
    );
  }
}
