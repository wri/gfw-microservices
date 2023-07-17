import React, { Component } from 'react';
import Select from 'react-select';
import Dialog from 'material-ui/Dialog';
import UserProfileManager from './UserProfileManager';
import { fieldValidations } from '../../../profile/js/utils/validations';
import GfwButton from '../../../common/js/components/GfwButton';
import Button from '../../../common/js/components/Button';
import { profilePage } from '../../../common/js/config';
import '../../../profile/css/profile.scss';

export default class AccountProfile extends Component {
  constructor(props) {
    super(props);
    const classesArray = this.props.currentAccount.organization_classifications_ids
      .split(',')
      .map((classification) => {
        const classId = parseInt(classification, 10);
        const data = this.props.classificationsData.find((c) => c.id === classId);
        return data
          ? { label: data.classification_name, value: classId }
          : { label: '', value: classId };
      });
    const usersArray = this.setAccountUsers();
    this.state = {
      organization_id: this.props.currentAccount.organization_id,
      organization_address: this.props.currentAccount.organization_address,
      organization_is_subsidiary: this.props.currentAccount.organization_is_subsidiary
        ? this.props.currentAccount.organization_is_subsidiary
        : false,
      organization_name: this.props.currentAccount.organization_name,
      organization_parent: this.props.currentAccount.organization_parent,
      organization_website: this.props.currentAccount.organization_website,
      classifications: classesArray,
      organization_status_id: this.props.currentAccount.organization_status_id,
      policyList: this.props.policyList,
      policyUploadList: [],
      policyNames: [],
      policySelectedList: [],
      users: usersArray,
      dialogOpen: false,
      dialogTitle: '',
      dialogMessage: '',
      activating: false,
    };
  }

  setAccountUsers = () => {
    return this.props.users.filter((user) => {
      return user.organization_id === this.props.currentAccount.organization_id;
    });
  };

  classChange = (results) => {
    this.setState({ classifications: results });
  };

  back = () => {
    window.location.href = '/pro-manager-list?tab=accounts';
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

  activateAccount = () => {
    const xmlhttp = new XMLHttpRequest();
    const { organization_status_id } = this.state;
    const route =
      organization_status_id === 1
        ? '/pro-manager/activateProAccount'
        : '/pro-manager/activateProActiveAccount';
    xmlhttp.open('POST', route);
    this.setState({
      dialogOpen: true,
      dialogTitle: 'Activating...',
      dialogMessage: '',
      activating: true,
    });
    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        const res = JSON.parse(xmlhttp.responseText);
        if (res.redirect) {
          this.setState({
            dialogOpen: false,
            dialogTitle: '',
            dialogMessage: '',
            activating: false,
          });
          window.location = res.redirect;
        }
        // Error activating account
        if (res.hasOwnProperty('errorCode')) {
          this.setState({
            dialogOpen: true,
            dialogTitle: 'Error Activating Account',
            dialogMessage: res.systemMessage.userMessage || res.systemMessage.message,
            activating: false,
          });
        }
      }
    };
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(
      JSON.stringify({
        id: this.state.organization_id,
      })
    );
  };

  deactivateAccount = () => {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', '/pro-manager/deactivateProAccount');
    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        const res = JSON.parse(xmlhttp.responseText);
        if (res.redirect) {
          window.location = res.redirect;
        }
      }
    };
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(
      JSON.stringify({
        id: this.state.organization_id,
        status: this.state.organization_status_id,
      })
    );
  };

  deleteAccountRequest = () => {
    const { organization_id, organization_status_id } = this.state;
    // Ensure the account is in pending state before deletetion
    if (organization_status_id === 1) {
      const xmlhttp = new XMLHttpRequest();
      xmlhttp.open('POST', '/pro-manager/deleteProAccountRequest');
      xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          const res = JSON.parse(xmlhttp.responseText);
          if (res.redirect) {
            window.location = res.redirect;
          }
          if (res.hasOwnProperty('errorCode')) {
            this.setState({
              dialogOpen: true,
              dialogTitle: 'Error Deleting Request Account',
              dialogMessage: res.systemMessage.userMessage,
              activating: false,
            });
          }
        }
      };
      xmlhttp.setRequestHeader('Content-Type', 'application/json');
      xmlhttp.send(JSON.stringify({ id: organization_id }));
    }
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

    if (
      this.state.organization_is_subsidiary &&
      this.state.organization_parent.trim().length === 0
    ) {
      errors.push('You must provide a parent organization if your organization is a subsidy.');
    }
    if (
      !this.state.organization_is_subsidiary &&
      this.state.organization_parent.trim().length !== 0
    ) {
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
      const xmlhttp = new XMLHttpRequest();
      xmlhttp.open('POST', '/pro-manager/updateProAccount');
      xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          const res = JSON.parse(xmlhttp.responseText);
          if (res.redirect) {
            window.location = res.redirect;
          }
        }
      };
      xmlhttp.setRequestHeader('Content-Type', 'application/json');
      xmlhttp.send(
        JSON.stringify({
          id: this.state.organization_id,
          org_name: this.state.organization_name,
          org_address: this.state.organization_address,
          org_website: this.state.organization_website,
          parent_org_name: this.state.organization_parent,
          is_subsidiary: this.state.organization_is_subsidiary,
          arr_org_classification_ids: this.state.classifications.map((c) => c.value),
          policyUploadList: this.state.policyUploadList,
          policyNames: this.state.policyNames,
        })
      );
    } else if (errors.length > 0 && missing.length > 0) {
      errors.unshift('Please review for invalid characters:');
      missing.unshift('Please enter:');
      const errorsAndMissing = [...errors, ...missing];
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Invalid field entries & Mandatory fields missing',
        dialogMessage: errorsAndMissing,
        activating: false,
      });
    } else if (errors.length > 0) {
      errors.unshift('Please review for invalid characters: ');
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Invalid field entries',
        dialogMessage: errors,
        activating: false,
      });
    } else {
      missing.unshift('Please enter: ');
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Mandatory fields missing',
        dialogMessage: missing,
        activating: false,
      });
    }
  };

  updateSelected = (results) => {
    this.setState({ policySelectedList: results });
  };

  downloadPolicies = () => {
    const errors = [];
    let errorTitle;
    if (this.state.policySelectedList.length > 1) {
      errors.push('Too many files. Please select one.');
      errorTitle = 'Multiples files!';
    } else if (this.state.policySelectedList.length === 0) {
      errors.push('No policy files are selected. Please select one.');
      errorTitle = 'No files selected!';
    }

    if (errors.length === 0) {
      window.location.href = `/pro-manager/downloadPolicyPro/${this.state.policySelectedList[0].value}/${this.state.organization_id}`;
    } else {
      this.setState({
        dialogOpen: true,
        dialogTitle: errorTitle,
        dialogMessage: errors,
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
        policyList.push(reader.result);
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

  render() {
    const { dialogOpen, dialogTitle, dialogMessage } = this.state;
    const dialogContent =
      typeof dialogMessage === 'string' ? dialogMessage : dialogMessage?.map(this.generateMessages);
    const action = this.shouldCloseDialog;

    // TODO: Add my my Users table at the bottom! Users belonging to this account, presumably

    // ADD BACK IN IF WE NEED TO HAVE PRO MANAGER UPLOAD POLICIES!
    // <input name='org_policy' type='file' onChange={this.updatePolicy} className='account-info-input' multiple/>
    const options = this.props.classificationsData.map(this.createClassOptions);
    const policyOptions = this.props.policyList
      .filter((policy) => policy.organization_id === this.state.organization_id)
      .map(this.createPolicyOptions);
    const defaultAction = this.state.activating
      ? []
      : [
          <div>
            <Button variant="primary" label="Ok" keyboardFocused onClick={action} />
          </div>,
        ];

    return (
      <div className="profile-body">
        <Dialog
          paperClassName="dialog-paper"
          open={dialogOpen}
          title={dialogTitle}
          actions={defaultAction}
          onRequestClose={action}
        >
          {dialogContent}
        </Dialog>

        <section className="flex-grid space-between align-center">
          <div>
            <h2 className="section-title-normal">Account Profile</h2>
          </div>
          <GfwButton classNames="btn-green" onClick={this.back} value="Back to Profile Manager" />
        </section>

        <section className="section-container">
          <div className="flex-grid-thirds">
            <div className="col">
              <div className="flex-grid-column">
                <div className="col flex-grid-column">
                  <span className="profile-label required-param">Organization Name</span>
                  <input
                    value={this.state.organization_name}
                    disabled={this.props.disable}
                    required
                    id="organization"
                    name="organization_name"
                    onChange={this.updateName}
                    className="account-info-input"
                  />
                </div>
              </div>
              <div className="flex-grid-column">
                <div className="col flex-grid-column">
                  <span className="profile-label required-param">Organization Address</span>
                  <input
                    value={this.state.organization_address}
                    disabled={this.props.disable}
                    required
                    id="organization"
                    name="organization_address"
                    onChange={this.updateAddress}
                    className="account-info-input"
                  />
                </div>
              </div>
              <div className="flex-grid-column">
                <div className="col flex-grid-column">
                  <span className="profile-label label--block required-param">
                    Account Classifications
                  </span>
                  <Select
                    required
                    disabled={this.props.disable}
                    name="account_id"
                    placeholder={profilePage.profileManager.multiselectPrompt}
                    isMulti
                    isSearchable
                    maxMenuHeight={150}
                    options={options}
                    onChange={this.classChange}
                    value={this.state.classifications}
                  />
                </div>
              </div>
            </div>
            <div className="col">
              <div className="flex-grid-column">
                <div className="col flex-grid-column">
                  <span className="profile-label" />
                  <input
                    id="updateSubsidary"
                    checked={this.state.organization_is_subsidiary}
                    disabled={this.props.disable}
                    name="is_subsidiary"
                    type="checkbox"
                    onChange={this.updateSubsidary}
                    className="account-info-input"
                  />
                  <label
                    htmlFor="updateSubsidary"
                    className="profile-label profile-checkbox__label"
                  >
                    Is Subsidiary ?
                  </label>
                </div>
              </div>
              <div className="flex-grid-column">
                <div className="col flex-grid-column">
                  <span className="profile-label required-param">Organization Website</span>
                  <input
                    value={this.state.organization_website}
                    disabled={this.props.disable}
                    required
                    name="organization_website"
                    onChange={this.updateWebsite}
                    className="account-info-input"
                  />
                </div>
              </div>
            </div>
            <div className="col">
              <div className="flex-grid-column">
                <div className="col flex-grid-column">
                  <span className="profile-label">Parent Organization</span>
                  <input
                    value={this.state.organization_parent}
                    disabled={this.props.disable}
                    required={this.state.organization_is_subsidiary === true}
                    name="organization_parent"
                    onChange={this.updateParent}
                    className="account-info-input"
                  />
                </div>
              </div>
              <div className="flex-grid-column">
                <div className="col flex-grid-column">
                  <span className="profile-label">Organization Policy</span>
                  <form method="post" encType="multipart/form-data">
                    <Select
                      required
                      disabled={this.props.disable}
                      name="account_id"
                      isMulti
                      isSearchable
                      maxMenuHeight={150}
                      options={policyOptions}
                      onChange={this.updateSelected}
                      value={this.state.policySelectedList}
                    />
                    {/* <div className='policies-delete-download'>
                      <GfwButton classNames={`btn-green ${this.state.organization_status_id === 2 ? '' : 'hidden'}`} onClick={this.downloadPolicies} value='Download' />
                    </div> */}
                  </form>
                </div>
              </div>
              <div className="flex-grid-column">
                <div className="col flex-grid-column space-element">
                  <span className="profile-label">Current Account Status</span>
                  <select
                    value={this.state.organization_status_id}
                    disabled
                    required
                    name="user_title_id"
                    ref="titleSelect"
                    onChange={this.titleChange}
                  >
                    <option value={1}>Pending</option>
                    <option value={2}>Active</option>
                    <option value={3}>Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        <UserProfileManager
          users={this.state.users}
          statusData={this.props.statusData}
          accessData={this.props.accessData}
        />

        <div className="profile-button-container justify-end">
          <GfwButton
            classNames={`btn-green ${this.props.disable ? 'hide' : ''}`}
            onClick={this.updateAccount}
            value="Save"
          />
          <GfwButton
            classNames={`btn-green ${
              this.state.organization_status_id === 2 ? 'button-disabled' : ''
            }`}
            disabled={this.state.organization_status_id === 2}
            onClick={this.activateAccount}
            value="Activate"
          />
          <GfwButton
            classNames={`btn-green ${this.state.organization_status_id === 1 ? 'hidden' : ''} ${
              this.state.organization_status_id === 3 ? 'button-disabled' : ''
            }`}
            disabled={this.state.organization_status_id === 3}
            onClick={this.deactivateAccount}
            value="Deactivate"
          />
          <GfwButton
            classNames={`btn-green ${this.state.organization_status_id === 1 ? '' : 'hidden'}`}
            onClick={this.deleteAccountRequest}
            value="Delete"
          />
        </div>
      </div>
    );
  }
}
