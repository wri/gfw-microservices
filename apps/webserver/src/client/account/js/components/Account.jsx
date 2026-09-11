import { Component } from 'react';
import Select from 'react-select';
import {
  Box,
  Grid,
  Link,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import Page from '../../../common/js/components/Page';
import SubHeader from '../../../common/js/components/SubHeader';
import GfwSelect from '../../../common/js/components/GfwSelect';
import countries from '../../../common/js/utils/countries.utils';
import {
  termsOfServices,
  privacyPolicy,
  profilePage,
  licenseAgreement,
} from '../../../common/js/config';

import '../../css/account.scss';
import { fieldValidations } from '../../../profile/js/utils/validations';
import requestAccountStrings from './requestAccountStrings';
import LegalBanner from './LegalBanner';
import AccountRequestBanner from '../../../common/js/components/Banners/AccountRequestBanner';
import { Link as LinkButton, PillButton } from '../../../components';

export default class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      org_name: '',
      is_subsidiary: false,
      parent_org_name: '',
      org_address: '',
      org_country: '',
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
    const { org_name, parent_org_name, org_address, user_first_name, user_last_name } = this.state;
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
    fieldValidations.organization_name.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(this.state.org_name.trim()) === false) {
        missing.push(fieldValidations.organization_name.text);
      }
    });

    if (this.state.org_name.trim().length > 150) {
      errors.push('You organization name must have less than 150 characters.');
    }
    if (this.state.is_subsidiary && this.state.parent_org_name.trim().length === 0) {
      errors.push('You must provide a parent organization if your organization is a subsidy.');
    }
    if (!this.state.is_subsidiary && this.state.parent_org_name.trim().length !== 0) {
      errors.push('You must check the subsidiary box if a parent organization is supplied.');
    }
    if (parseInt(this.state.user_title_id) === 10 && this.state.otherTitle.trim().length === 0) {
      errors.push('You must provide an alternative title.');
    }
    if (this.state.arr_org_classification_ids.length === 0) {
      missing.push('Organization Classification');
    }
    if (this.state.org_country.length === 0) {
      missing.push('Organization Country');
    }

    fieldValidations.organization_address.validations.forEach((validation) => {
      if (validation(this.state.org_address.trim()) === false) {
        errors.push(fieldValidations.organization_address.text);
      }
    });
    fieldValidations.organization_address.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(this.state.org_address.trim()) === false) {
        missing.push(fieldValidations.organization_address.text);
      }
    });

    fieldValidations.organization_website.validations.forEach((validation) => {
      if (validation(this.state.org_website.trim()) === false) {
        errors.push(fieldValidations.organization_website.text);
      }
    });

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
            org_country: '',
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
            dialogMessage: 'This account request has failed. Please try again at another time.',
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
      obj.arr_org_classification_ids = this.state.arr_org_classification_ids.map((c) => c.value);
      obj.arr_user_geography_ids = this.state.arr_user_geography_ids.map((g) => g.value);
      obj.arr_user_commodity_ids = this.state.arr_user_commodity_ids.map((c) => c.value);
      obj.org_country = this.state.org_country.value;
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

  updateCountry = (results) => {
    this.setState({
      org_country: results,
    });
  };

  updateWebsite = (evt) => {
    this.setState({
      org_website: evt.target.value.trim(),
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

  createCountryOptions = (option) => {
    return { label: option, value: option };
  };

  createClassOptions = (option) => {
    return { label: option.classification_name, value: option.id };
  };

  createGeogOptions = (option) => {
    return { label: option.geography_name, value: option.id };
  };

  createCommOptions = (option) => {
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
    const { dialogOpen, dialogTitle, dialogMessage, accountSubmitted, creatingAccount } =
      this.state;
    const dialogContent =
      typeof dialogMessage === 'string' ? dialogMessage : dialogMessage.map(this.generateMessages);

    const action = accountSubmitted ? this.shouldRedirect : this.shouldCloseDialog;

    const defaultAction = creatingAccount
      ? []
      : [
          <PillButton variant="contained" autoFocus onClick={action}>
            OK
          </PillButton>,
        ];

    const options = this.props.classificationsData.map(this.createClassOptions);
    const countryOptions = countries.map(this.createCountryOptions);
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
        <SubHeader
          header={requestAccountStrings.requestAccount.title}
          subHeader={requestAccountStrings.requestAccount.subHeader}
        />
        <AccountRequestBanner />
        <div className="account">
          <Grid container spacing={2} sx={{ paddingBottom: 2 }}>
            <Grid item xs={7}>
              <section>
                <h2 className="section-title-large">
                  {requestAccountStrings.sectionTitles.accountInfo}
                </h2>
                <div>
                  <div className="input-field__block-container">
                    <label htmlFor="org_name" className="block-label profile-label required-param">
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
                      htmlFor="org_country"
                      className="block-label profile-label required-param"
                    >
                      Organization Country
                    </label>
                    <Select
                      placeholder={profilePage.profileManager.selectCountry}
                      isMulti={false}
                      isSearchable={true}
                      maxMenuHeight={150}
                      options={countryOptions}
                      name="org_country"
                      id="org_country"
                      onChange={this.updateCountry}
                      value={this.state.org_country}
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
                    <label htmlFor="org_website" className="block-label profile-label">
                      Organization Website
                    </label>
                    <input
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
                </div>
              </section>
              <section>
                <h2 className="section-title-large">
                  {requestAccountStrings.sectionTitles.accountManagerContactInfo}
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
                  <label htmlFor="user_email" className="block-label profile-label required-param">
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
                  <label htmlFor="user_phone" className="block-label profile-label">
                    Phone
                  </label>
                  <input
                    id="user_phone"
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
                  <Typography variant="body2">
                    <Box sx={{ fontWeight: 500 }}>
                      {requestAccountStrings.helpTooltip.prefix}
                      <Link href={requestAccountStrings.helpTooltip.link} target="_blank">
                        {requestAccountStrings.helpTooltip.linkText}
                      </Link>
                      {requestAccountStrings.helpTooltip.suffix}
                    </Box>
                    {requestAccountStrings.helpTooltip.explanation}
                  </Typography>
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
                    <a href={termsOfServices} className="gfw-green" target="_blank">
                      Terms of Use
                    </a>
                    ,{' '}
                    <a href={privacyPolicy} className="gfw-green" target="_blank">
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a href={licenseAgreement} className="gfw-green" target="_blank">
                      License Agreement
                    </a>
                    .
                  </label>
                </div>
              </section>
              <section>
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 2 }}>
                  <PillButton variant="contained" onClick={this.submitOrg}>
                    Submit
                  </PillButton>
                  <LinkButton href="/">Cancel</LinkButton>
                </Box>
              </section>
            </Grid>
            <Grid item xs={5}>
              <LegalBanner />
            </Grid>
            <Dialog open={dialogOpen} onClose={action} PaperProps={{ className: 'dialog-paper' }}>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogContent>{dialogContent}</DialogContent>
              <DialogActions>{defaultAction}</DialogActions>
            </Dialog>
          </Grid>
        </div>
      </Page>
    );
  }
}
