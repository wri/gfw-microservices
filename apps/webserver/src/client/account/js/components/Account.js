import React, { Component } from 'react';
import Page from '../../../common/js/components/Page';
import Select from 'react-select';
import Dialog from 'material-ui/Dialog';
import SubHeader from '../../../common/js/components/SubHeader';
import Button from '../../../common/js/components/Button';
import LinkButton from '../../../common/js/components/LinkButton';
import GfwSelect from '../../../common/js/components/GfwSelect';
import { fieldValidations } from '../../../profile/js/utils/validations';
import {
  termsAndConditions,
  privacyPolicy,
  profilePage,
} from '../../../common/js/config';
import '../../css/account.scss';

export default class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      org_name: '',
      is_subsidiary: false,
      parent_org_name: '',
      org_address: '',
      org_website: '',
      policyList: [],
      policyName: [],
      arr_org_classification_ids: [],
      user_first_name: '',
      user_last_name: '',
      user_email: '',
      user_phone: '',
      user_title_id: 1, //Analyst
      user_title: 'Analyst',
      arr_user_commodity_ids: [],
      arr_user_geography_ids: [],
      dialogOpen: false,
      dialogTitle: '',
      dialogMessage: '',
      otherTitle: '',
      checked: false,
      creatingAccount: false,
      accountSubmitted: false,
    };
  }

  removeExtraSpaces = () => {
    const {
      org_name,
      parent_org_name,
      org_address,
      user_first_name,
      user_last_name,
    } = this.state;
    this.setState({
      org_name: org_name.trim(),
      parent_org_name: parent_org_name.trim(),
      org_address: org_address.trim(),
      user_first_name: user_first_name.trim(),
      user_last_name: user_last_name.trim(),
    });
  };

  submitOrg = () => {
    this.setState({
      dialogOpen: true,
      dialogTitle: 'Account is being created, please wait.',
      dialogMessage: '',
      creatingAccount: true,
    });
    // TODO: validations for all of our required inputs!!
    const errors = [];
    const missing = [];

    fieldValidations.organization_name.validations.forEach((validation) => {
      if (validation(this.state.org_name.trim()) === false) {
        errors.push(fieldValidations.organization_name.text);
      }
    });
    fieldValidations.organization_name.mandatoryChecks.forEach(
      (mandatoryCheck) => {
        if (mandatoryCheck(this.state.org_name.trim()) === false) {
          missing.push(fieldValidations.organization_name.text);
        }
      }
    );

    if (this.state.org_name.trim().length > 150) {
      errors.push('You organization name must have less than 150 characters.');
    }
    if (
      this.state.is_subsidiary &&
      this.state.parent_org_name.trim().length === 0
    ) {
      errors.push(
        'You must provide a parent organization if your organization is a subsidy.'
      );
    }
    if (
      !this.state.is_subsidiary &&
      this.state.parent_org_name.trim().length !== 0
    ) {
      errors.push(
        'You must check the subsidiary box if a parent organization is supplied.'
      );
    }
    if (
      parseInt(this.state.user_title_id) === 10 &&
      this.state.otherTitle.trim().length === 0
    ) {
      errors.push('You must provide an alternative title.');
    }
    if (this.state.arr_org_classification_ids.length === 0) {
      missing.push('Organization Classification');
    }

    fieldValidations.organization_address.validations.forEach((validation) => {
      if (validation(this.state.org_address.trim()) === false) {
        errors.push(fieldValidations.organization_address.text);
      }
    });
    fieldValidations.organization_address.mandatoryChecks.forEach(
      (mandatoryCheck) => {
        if (mandatoryCheck(this.state.org_address.trim()) === false) {
          missing.push(fieldValidations.organization_address.text);
        }
      }
    );

    fieldValidations.organization_website.validations.forEach((validation) => {
      if (validation(this.state.org_website.trim()) === false) {
        errors.push(fieldValidations.organization_website.text);
      }
    });
    fieldValidations.organization_website.mandatoryChecks.forEach(
      (mandatoryCheck) => {
        if (mandatoryCheck(this.state.org_website.trim()) === false) {
          missing.push(fieldValidations.organization_website.text);
        }
      }
    );

    fieldValidations.first_name.validations.forEach((validation) => {
      if (validation(this.state.user_first_name.trim()) === false) {
        errors.push(fieldValidations.first_name.text);
      }
    });
    fieldValidations.first_name.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(this.state.user_first_name.trim()) === false) {
        missing.push(fieldValidations.first_name.text);
      }
    });

    fieldValidations.last_name.validations.forEach((validation) => {
      if (validation(this.state.user_last_name.trim()) === false) {
        errors.push(fieldValidations.last_name.text);
      }
    });
    fieldValidations.last_name.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(this.state.user_last_name.trim()) === false) {
        missing.push(fieldValidations.last_name.text);
      }
    });

    fieldValidations.email.validations.forEach((validation) => {
      if (validation(this.state.user_email) === false) {
        errors.push(fieldValidations.email.text);
      }
    });
    fieldValidations.email.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(this.state.user_email.trim()) === false) {
        missing.push(fieldValidations.email.text);
      }
    });

    fieldValidations.phone.validations.forEach((validation) => {
      if (validation(this.state.user_phone.trim()) === false) {
        errors.push(fieldValidations.phone.text);
      }
    });
    fieldValidations.phone.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(this.state.user_phone.trim()) === false) {
        missing.push(fieldValidations.phone.text);
      }
    });

    if (!this.state.checked) {
      missing.push('You must agree to the terms and conditions.');
    }

    if (errors.length === 0 && missing.length === 0) {
      const request = new XMLHttpRequest();
      request.onload = () => {
        const userEmail = this.state.user_email;

        if (request.responseText === 'AccountRequested') {
          this.setState({
            dialogOpen: true,
            dialogTitle: 'Account Successfully Requested',
            dialogMessage: `Thank you for submitting your GFW Pro account application. We will review your application and respond to ${userEmail} within two business days.`,
            creatingAccount: false,
            accountSubmitted: true,
            org_name: '',
            is_subsidiary: false,
            parent_org_name: '',
            org_address: '',
            org_website: '',
            policyList: [],
            policyName: [],
            arr_org_classification_ids: [],
            user_first_name: '',
            user_last_name: '',
            user_email: '',
            user_phone: '',
            user_title_id: 1, //Analyst
            user_title: 'Analyst',
            arr_user_commodity_ids: [],
            arr_user_geography_ids: [],
            otherTitle: '',
            checked: false,
          });
        } else {
          this.setState({
            dialogOpen: true,
            dialogTitle: 'Account Not Created',
            dialogMessage:
              'This account request has failed. Please try again at another time.',
            creatingAccount: false,
          });
        }
      };
      request.onerror = (err) => {
        this.setState({
          loginError: false,
        });
        console.log(`Error: ${err}`);
      };
      request.open('POST', '/createnewaccount', true);
      request.setRequestHeader('Content-Type', 'application/json');
      const obj = Object.assign({}, this.state);
      obj.arr_org_classification_ids =
        this.state.arr_org_classification_ids.map((c) => c.value);
      obj.arr_user_geography_ids = this.state.arr_user_geography_ids.map(
        (g) => g.value
      );
      obj.arr_user_commodity_ids = this.state.arr_user_commodity_ids.map(
        (c) => c.value
      );
      request.send(JSON.stringify(obj));
    } else {
      if (errors.length > 0 && missing.length > 0) {
        errors.unshift('Please review for invalid characters:');
        missing.unshift('Please enter:');
        const errorsAndMissing = [...errors, ...missing];
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Invalid field entries & Mandatory fields missing',
          dialogMessage: errorsAndMissing,
          creatingAccount: false,
        });
      } else if (errors.length > 0) {
        errors.unshift('Please review for invalid characters:');
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Invalid field entries',
          dialogMessage: errors,
          creatingAccount: false,
        });
      } else {
        missing.unshift('Please enter:');
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Mandatory fields missing',
          dialogMessage: missing,
          creatingAccount: false,
        });
      }
    }
  };

  updateOrganization = (evt) => {
    this.setState({
      org_name: evt.target.value,
    });
  };

  updateSubsidary = (evt) => {
    this.setState({
      is_subsidiary: evt.target.checked,
    });
  };

  updateParentOrg = (evt) => {
    this.setState({
      parent_org_name: evt.target.value,
    });
  };

  updateAddress = (evt) => {
    this.setState({
      org_address: evt.target.value,
    });
  };

  updateWebsite = (evt) => {
    this.setState({
      org_website: evt.target.value.trim(),
    });
  };

  updatePolicy = (evt) => {
    const policyList = [];
    const policyNameList = [];
    for (const key of Object.keys(evt.target.files)) {
      policyNameList.push(evt.target.files[key].name);
      const reader = new FileReader();
      reader.readAsDataURL(evt.target.files[key]);
      reader.onload = function () {
        policyList.push(
          reader.result.match(/base64,(.*)/)[1]
            ? reader.result.match(/base64,(.*)/)[1]
            : ''
        );
      };
      reader.onerror = function (error) {
        console.log('Error: ', error);
      };
    }
    this.setState({
      policyList: policyList,
      policyName: policyNameList,
    });
  };

  updateName = (evt) => {
    this.setState({
      user_first_name: evt.target.value,
    });
  };

  updateLastName = (evt) => {
    this.setState({
      user_last_name: evt.target.value,
    });
  };

  updateEmail = (evt) => {
    this.setState({
      user_email: evt.target.value.trim(),
    });
  };

  updatePhone = (evt) => {
    this.setState({
      user_phone: evt.target.value.trim(),
    });
  };

  createClassOptions = (option, i) => {
    return { label: option.classification_name, value: option.id };
  };

  createGeogOptions = (option, i) => {
    return { label: option.geography_name, value: option.id };
  };

  createCommOptions = (option, i) => {
    return { label: option.commmodity_name, value: option.id };
  };

  orgChange = (results) => {
    this.setState({ arr_org_classification_ids: results });
  };

  geogChange = (results) => {
    this.setState({ arr_user_geography_ids: results });
  };

  commChange = (results) => {
    this.setState({ arr_user_commodity_ids: results });
  };

  titleChange = (evt) => {
    this.setState({
      user_title: evt.label,
      user_title_id: parseInt(evt.value),
    });
  };

  updateOther = (evt) => {
    this.setState({ otherTitle: evt.target.value });
  };

  updateChecked = () => {
    this.setState({ checked: !this.state.checked });
  };

  shouldCloseDialog = () => {
    this.setState({ dialogOpen: false });
  };

  shouldRedirect = () => {
    window.location.href = '/';
  };

  generateMessages = (message, i) => {
    return <p key={message + i}>{message}</p>;
  };

  render() {
    const {
      dialogOpen,
      dialogTitle,
      dialogMessage,
      accountSubmitted,
      creatingAccount,
    } = this.state;
    const dialogContent =
      typeof dialogMessage === 'string'
        ? dialogMessage
        : dialogMessage.map(this.generateMessages);

    const action = accountSubmitted
      ? this.shouldRedirect
      : this.shouldCloseDialog;

    const defaultAction = creatingAccount
      ? []
      : [
          <Button
            variant="primary"
            label="OK"
            keyboardFocused={true}
            onClick={action}
          />,
        ];

    const options = this.props.classificationsData.map(this.createClassOptions);
    const commOptions = this.props.commoditiesData.map(this.createCommOptions);
    const geogOptions = this.props.geographiesData.map(this.createGeogOptions);
    const user_title = this.state.user_title;
    const titleOptions = this.props.titlesData.map((titleData) => {
      return {
        label: titleData.title,
        value: titleData.id,
      };
    });

    return (
      <Page>
        <Dialog
          paperClassName="dialog-paper"
          open={dialogOpen}
          title={dialogTitle}
          actions={defaultAction}
          onRequestClose={action}
        >
          {dialogContent}
        </Dialog>
        <SubHeader
          header="Request New Account"
          subHeader="Please complete all mandatory fields * below and submit."
        />
        <div className="account">
          <section>
            <h2 className="section-title-large">Account Information</h2>
            <div>
              <div className="input-field__block-container">
                <label
                  htmlFor="org_name"
                  className="block-label profile-label required-param"
                >
                  Organization Name
                </label>
                <input
                  required
                  id="org_name"
                  name="org_name"
                  value={this.state.org_name}
                  onChange={this.updateOrganization}
                  onBlur={this.removeExtraSpaces}
                />
              </div>

              <div className="input-field__block-container">
                <span className="profile-label"></span>
                <input
                  id="isSubsidiary"
                  name="is_subsidiary"
                  value={this.state.is_subsidiary}
                  type="checkbox"
                  className="hidden"
                  onChange={this.updateSubsidary}
                />
                <label htmlFor="isSubsidiary" className="profile-label">
                  Subsidiary?
                </label>
              </div>

              <div className="input-field__block-container">
                <label
                  htmlFor="org_address"
                  className="block-label profile-label required-param"
                >
                  Organization Address
                </label>
                <input
                  required
                  name="org_address"
                  id="org_address"
                  value={this.state.org_address}
                  onChange={this.updateAddress}
                  onBlur={this.removeExtraSpaces}
                />
              </div>
              <div className="input-field__block-container">
                <label
                  htmlFor="arr_org_classification_ids"
                  className="block-label profile-label required-param"
                >
                  Organization Classifications
                </label>
                <Select
                  placeholder={profilePage.profileManager.multiselectPrompt}
                  isMulti={true}
                  isSearchable={true}
                  maxMenuHeight={150}
                  options={options}
                  name="arr_org_classification_ids"
                  id="arr_org_classification_ids"
                  onChange={this.orgChange}
                  value={this.state.arr_org_classification_ids}
                />
              </div>
              <div className="input-field__block-container">
                <label
                  htmlFor="org_website"
                  className="block-label profile-label required-param"
                >
                  Organization Website
                </label>
                <input
                  required
                  name="org_website"
                  id="org_website"
                  value={this.state.org_website}
                  onChange={this.updateWebsite}
                />
              </div>
              <div className="input-field__block-container">
                <label
                  htmlFor="parent_org_name"
                  className={`block-label profile-label ${
                    this.state.is_subsidiary === true ? 'required-param' : ''
                  }`}
                >
                  Parent Organization
                </label>
                <input
                  id="parent_org_name"
                  required={this.state.is_subsidiary === true}
                  name="parent_org_name"
                  value={this.state.parent_org_name}
                  onChange={this.updateParentOrg}
                  className="account-info-input required-param"
                  onBlur={this.removeExtraSpaces}
                />
              </div>
              <div className="input-field__block-container">
                <label className="block-label profile-label">
                  Organization Policy
                </label>
                <span className="hint-text">
                  Upload policy document to reference within the system (.doc,
                  .pdf)
                </span>
                <div className="upload-policy-container">
                  <form
                    className="policies-form"
                    method="post"
                    encType="multipart/form-data"
                  >
                    <label
                      htmlFor="uploadPolicy"
                      className="gfw-button btn-green"
                    >
                      {'Upload policy'}{' '}
                      <span>{`${
                        this.state.policyName.length === 0
                          ? ''
                          : this.state.policyName.length === 1
                          ? ': 1 document'
                          : `: ${this.state.policyName.length} documents`
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
                  </form>
                </div>
              </div>
            </div>
          </section>
          <section>
            <h2 className="section-title-large">
              Account Manager Contact Information
            </h2>

            <div className="input-field__block-container">
              <label
                htmlFor="user_first_name"
                className="block-label profile-label required-param"
              >
                First Name
              </label>
              <input
                id="user_first_name"
                required
                name="user_first_name"
                value={this.state.user_first_name}
                onChange={this.updateName}
                onBlur={this.removeExtraSpaces}
              />
            </div>

            <div className="input-field__block-container">
              <label
                htmlFor="user_last_name"
                className="block-label profile-label required-param"
              >
                Last Name
              </label>
              <input
                id="user_last_name"
                required
                name="user_last_name"
                value={this.state.user_last_name}
                onChange={this.updateLastName}
                maxLength="35"
                onBlur={this.removeExtraSpaces}
              />
            </div>

            <div className="input-field__block-container">
              <label
                htmlFor="user_email"
                className="block-label profile-label required-param"
              >
                E-mail
              </label>
              <input
                id="user_email"
                required
                name="user_email"
                value={this.state.user_email}
                onChange={this.updateEmail}
                maxLength="50"
              />
            </div>

            <div className="input-field__block-container">
              <label
                htmlFor="user_phone"
                className="block-label profile-label required-param"
              >
                Phone
              </label>
              <input
                id="user_phone"
                required
                name="user_phone"
                value={this.state.user_phone}
                onChange={this.updatePhone}
                maxLength="50"
              />
            </div>

            <div className="input-field__block-container">
              <label
                htmlFor="title-select"
                className="block-label profile-label required-param"
              >
                Title
              </label>
              <GfwSelect
                if="title-select"
                options={titleOptions}
                value={user_title}
                onChange={(evt) => this.titleChange(evt)}
                style={{ width: '100%', maxWidth: '400px' }}
              />
            </div>

            <div
              className={`input-field__block-container${
                this.state.user_title_id === 10 ? '' : ' hidden'
              }`}
            >
              <label
                htmlFor="alternative_title"
                className="block-label profile-label required-param"
              >
                Alternative Title
              </label>
              <input
                id="alternative_title"
                required
                name="alternative_title"
                value={this.state.otherTitle}
                onChange={this.updateOther}
              />
            </div>

            <div className="input-field__block-container">
              <label
                htmlFor="arr_user_commodity_ids"
                className="block-label profile-label-select"
              >
                Geographies of Interest
              </label>
              <Select
                placeholder={profilePage.profileManager.multiselectPrompt}
                isMulti={true}
                isSearchable={true}
                maxMenuHeight={150}
                options={geogOptions}
                id="arr_user_commodity_ids"
                name="arr_user_commodity_ids"
                onChange={this.geogChange}
                value={this.state.arr_user_geography_ids}
              />
            </div>

            <div className="input-field__block-container">
              <label
                htmlFor="arr_user_geography_ids"
                className="block-label profile-label-select"
              >
                Commodities of Interest
              </label>
              <Select
                placeholder={profilePage.profileManager.multiselectPrompt}
                isMulti={true}
                isSearchable={true}
                maxMenuHeight={150}
                options={commOptions}
                onChange={this.commChange}
                value={this.state.arr_user_commodity_ids}
              />
            </div>

            <div className="input-field__block-container">
              <input
                id="checkBox"
                checked={this.state.checked}
                onChange={this.updateChecked}
                type="checkbox"
              />
              <label htmlFor="checkBox">
                I have read and accept the{' '}
                <a
                  href={termsAndConditions}
                  className="gfw-green"
                  target="_blank"
                >
                  GFW Pro Terms & Conditions
                </a>{' '}
                and{' '}
                <a href={privacyPolicy} className="gfw-green" target="_blank">
                  Privacy Policy
                </a>
                .
              </label>
            </div>
          </section>
          <section>
            <div>
              <Button
                variant="primary"
                style={{ maringRight: '15px' }}
                onClick={this.submitOrg}
                label="Submit"
              />
              <LinkButton
                onClick={() => {
                  window.location.href = '/';
                }}
                label="Cancel"
              />
            </div>
          </section>
        </div>
      </Page>
    );
  }
}
