import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import Select from 'react-select';
import qr from 'qrcode';
import { profilePage } from '../../../common/js/config';
import Button from '../../../common/js/components/Button';
import { fieldValidations } from '../../../profile/js/utils/validations';
import GfwButton from '../../../common/js/components/GfwButton';
import '../../css/profile.scss';

export default class UserProfile extends Component {
  constructor(props) {
    super(props);
    const geographyArray = this.props.currentUser.user_geography_ids.split(',').map((geo) => {
      const geogId = parseInt(geo);
      const data = this.props.geographiesData.find((d) => d.id == geogId);
      return data ? { label: data.geography_name, value: geogId } : { label: '', value: geogId };
    });
    const commoditiesArray = this.props.currentUser.user_commodity_ids
      .split(',')
      .map((commodity) => {
        const commId = parseInt(commodity);
        const data = this.props.commoditiesData.find((d) => d.id == commId);
        return data ? { label: data.commmodity_name, value: commId } : { label: '', value: commId };
      });
    this.state = {
      user_id: this.props.currentUser.user_id ? this.props.currentUser.user_id : '',
      first_name: this.props.currentUser.first_name ? this.props.currentUser.first_name : '',
      middle_initial: this.props.currentUser.middle_initial
        ? this.props.currentUser.middle_initial
        : '',
      last_name: this.props.currentUser.last_name ? this.props.currentUser.last_name : '',
      email: this.props.currentUser.email ? this.props.currentUser.email : '',
      accounts: [],
      phone: this.props.currentUser.phone ? this.props.currentUser.phone : '',
      org_class: '',
      org_name: '',
      access_level_id: this.props.currentUser.access_level_id
        ? this.props.currentUser.access_level_id
        : 3,
      status_id: this.props.currentUser.user_status_id ? this.props.currentUser.user_status_id : 1,
      title: this.props.currentUser.title_id ? this.props.currentUser.title_id : 1,
      other_title: this.props.currentUser.other_title ? this.props.currentUser.other_title : '',
      geographies: geographyArray,
      commodities: commoditiesArray,
      viirsAlerts: this.props.currentUser.viirs_email_frequency
        ? this.props.currentUser.viirs_email_frequency
        : 0,
      gladAlerts: this.props.currentUser.glad_email_frequency
        ? this.props.currentUser.glad_email_frequency
        : 0,
      formaAlerts: this.props.currentUser.forma_email_frequency
        ? this.props.currentUser.forma_email_frequency
        : 0,
      granChacoAlerts: this.props.currentUser.gran_chaco_email_frequency
        ? this.props.currentUser.gran_chaco_email_frequency
        : 0,
      auth_preference_id: this.props.currentUser.auth_preference_id
        ? this.props.currentUser.auth_preference_id
        : 0,
      enableAlerts: this.props.currentUser.email_subscription
        ? this.props.currentUser.email_subscription
        : false,
      secondAuth: 'email',
      secret_url: '',
      secret: '',
      sharingInternal: 0,
      sharingExternal: 0,
      dialogOpen: false,
      dialogTitle: '',
      dialogMessage: '',
      updating: false,
      // saved: false,
      // activated: false
    };

    // Get the user QR Code
    if (
      this.props.currentUser.email &&
      this.state.newUser === false &&
      this.props.currentUser.auth_preference_id === 1
    ) {
      this.getQRCode();
    }
    console.log('this.props.currentUserthis.props.currentUser', this.props.currentUser);
  }

  getQRCode = () => {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', '/userSecret');

    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        const res = JSON.parse(xmlhttp.responseText);
        qr.toDataURL(res.url, (err, url) => {
          this.setState({
            secret: res.secret,
            secret_url: url,
          });
        });
      }
    };
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify({ email: this.state.email }));
  };

  updateAuthenticationPreference = (evt) => {
    this.setState(
      {
        auth_preference_id: parseInt(evt.target.value),
      },
      () => {
        // If the preference is Google Authenticator - get secret information
        if (this.state.auth_preference_id === 1) {
          this.getQRCode();
        }
      }
    );
  };

  assignState = (state) => {
    this.setState(state);
  };

  updateFirst = (evt) => {
    this.setState({ first_name: evt.target.value });
  };

  updateMiddle = (evt) => {
    this.setState({ middle_initial: evt.target.value });
  };

  updateLastName = (evt) => {
    this.setState({ last_name: evt.target.value });
  };

  updateEmail = (evt) => {
    this.setState({ email: evt.target.value });
  };

  updatePhone = (evt) => {
    this.setState({
      phone: evt.target.value,
    });
  };

  statusChange = (evt) => {
    this.setState({ status_id: evt.target.value });
  };

  accessChange = (evt) => {
    this.setState({ access_level_id: evt.target.value });
  };

  titleChange = (evt) => {
    this.setState({ title: parseInt(evt.target.value) });
  };

  updateOther = (evt) => {
    this.setState({ other_title: evt.target.value });
  };

  geogChange = (results) => {
    this.setState({ geographies: results });
  };

  commChange = (results) => {
    this.setState({ commodities: results });
  };

  updateEmailPrefs = () => {
    this.setState({ enableAlerts: !this.state.enableAlerts });
  };

  updateSecondAuth = (evt) => {
    const authId = evt.target.id === 'secondLevelAuthenticationEmail' ? 'email' : 'google';
    this.setState({ secondAuth: authId });
  };

  activateUser = () => {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', '/profile/activateUser');
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
        name: this.state.user_id,
        email: this.state.email,
      })
    );
  };

  deactivateUser = () => {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', '/profile/deactivateUser');
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
        name: this.state.user_id,
        email: this.state.email,
      })
    );
  };

  back = () => {
    window.location.href = '/pro-manager-list?tab=users';
  };

  // createClassOptions = (option, i) => {
  //   return <option value={option.id} id={option.id} key={i} className='classifications-option'>{option.classification_name}</option>;
  // }

  createGeogOptions = (option) => {
    return { label: option.geography_name, value: option.id };
  };

  createTitleOptions = (option, i) => {
    return (
      <option value={option.id} id={option.id} key={i} className="classifications-option">
        {option.title}
      </option>
    );
  };

  createCommOptions = (option) => {
    return { label: option.commmodity_name, value: option.id };
  };

  createStatusOptions = (option, i) => {
    return (
      <option value={option.id} id={option.id} key={i} className="classifications-option">
        {option.name}
      </option>
    );
  };

  createAccessOptions = (option, i) => {
    return (
      <option value={option.id} id={option.id} key={i} className="classifications-option">
        {option.name}
      </option>
    );
  };

  updateUser = () => {
    const errors = [];
    const missing = [];

    fieldValidations.first_name.validations.forEach((validation) => {
      if (validation(this.state.first_name) === false) {
        errors.push(fieldValidations.first_name.text);
      }
    });
    fieldValidations.first_name.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(this.state.first_name.trim()) === false) {
        missing.push(fieldValidations.first_name.text);
      }
    });

    fieldValidations.last_name.validations.forEach((validation) => {
      if (validation(this.state.last_name) === false) {
        errors.push(fieldValidations.last_name.text);
      }
    });
    fieldValidations.last_name.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(this.state.last_name.trim()) === false) {
        missing.push(fieldValidations.last_name.text);
      }
    });

    fieldValidations.email.validations.forEach((validation) => {
      if (validation(this.state.email) === false) {
        errors.push(fieldValidations.email.text);
      }
    });
    fieldValidations.email.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(this.state.email.trim()) === false) {
        missing.push(fieldValidations.email.text);
      }
    });

    fieldValidations.phone.validations.forEach((validation) => {
      if (validation(this.state.phone) === false) {
        errors.push(fieldValidations.phone.text);
      }
    });
    fieldValidations.phone.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(this.state.phone.trim()) === false) {
        missing.push(fieldValidations.phone.text);
      }
    });

    if (errors.length === 0 && missing.length === 0) {
      const route = '/pro-manager/updateProAccountUser';
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Updating...',
        dialogMessage: '',
        updating: true,
      });
      const xmlhttp = new XMLHttpRequest();
      xmlhttp.open('POST', route);
      xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          this.setState({
            dialogOpen: false,
            dialogTitle: '',
            dialogMessage: '',
            updating: true,
          });
          const res = JSON.parse(xmlhttp.responseText);
          if (res.redirect) {
            window.location = res.redirect;
          }
        }
      };
      xmlhttp.setRequestHeader('Content-Type', 'application/json');

      const geoString = this.state.geographies.map((g) => g.value).join(', ');
      const commoditiesString = this.state.commodities.map((c) => c.value).join(', ');
      xmlhttp.send(
        JSON.stringify({
          id: this.state.user_id,
          first_name: this.state.first_name,
          middle_initial: this.state.middle_initial,
          last_name: this.state.last_name,
          email: this.state.email,
          phone: this.state.phone,
          title: this.state.title,
          other_title: this.state.other_title,
          geographies: geoString,
          commodities: commoditiesString,
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

  shouldCloseDialog = () => {
    this.setState({ dialogOpen: false });
  };

  generateMessages = (message, i) => {
    return <p key={message + i}>{message}</p>;
  };

  createViirsOption = (option, j) => (
    <td key={j}>
      <input
        type="radio"
        id={option.id + 'viirs'}
        value={option.id}
        key={j + 'viirs'}
        checked={this.state.viirsAlerts === option.id}
        onChange={(evt) => this.setState({ viirsAlerts: parseInt(evt.target.value) })}
      />
      <label htmlFor={option.id + 'viirs'} className="profile-label">
        {option.name}
      </label>
    </td>
  );
  createGladOption = (option, j) => (
    <td key={j}>
      <input
        type="radio"
        id={option.id + 'glad'}
        value={option.id}
        key={j + 'glad'}
        checked={this.state.gladAlerts === option.id}
        onChange={(evt) => this.setState({ gladAlerts: parseInt(evt.target.value) })}
      />
      <label htmlFor={option.id + 'glad'} className="profile-label">
        {option.name}
      </label>
    </td>
  );

  createFormaOption = (option, j) => (
    <td key={j}>
      <input
        type="radio"
        id={option.id + 'forma'}
        value={option.id}
        key={j + 'forma'}
        checked={this.state.formaAlerts === option.id}
        onChange={(evt) => this.setState({ formaAlerts: parseInt(evt.target.value) })}
      />
      <label htmlFor={option.id + 'forma'} className="profile-label">
        {option.name}
      </label>
    </td>
  );

  createGranChacoOption = (option, j) => (
    <td key={j}>
      <input
        type="radio"
        id={option.id + 'granChaco'}
        value={option.id}
        key={j + 'granChaco'}
        checked={this.state.granChacoAlerts === option.id}
        onChange={(evt) => this.setState({ granChacoAlerts: parseInt(evt.target.value) })}
      />
      <label htmlFor={option.id + 'granChaco'} className="profile-label">
        {option.name}
      </label>
    </td>
  );

  render() {
    const { dialogOpen, dialogTitle, dialogMessage, updating } = this.state;
    const dialogContent =
      typeof dialogMessage === 'string' ? dialogMessage : dialogMessage.map(this.generateMessages);
    let action = this.shouldCloseDialog;

    if (dialogTitle === 'Account Successfully Requested') {
      action = this.shouldRedirect;
    }
    const defaultAction = updating
      ? []
      : [<Button variant="primary" label="OK" keyboardFocused={true} onClick={action} />];

    const statusOptions = profilePage.userProfile.statusOptions.map(this.createStatusOptions);
    const accessOptions = profilePage.userProfile.accessOptions.map(this.createAccessOptions);

    const viirsOptions = profilePage.userProfile.viirsEmailFrequencies.map(this.createViirsOption);
    const gladOptions = profilePage.userProfile.gladEmailFrequencies.map(this.createGladOption);
    const formaOptions = profilePage.userProfile.formaEmailFrequencies.map(this.createFormaOption);
    const granChacoOptions = profilePage.userProfile.granChacoEmailFrequencies.map(
      this.createGranChacoOption
    );

    const commOptions = this.props.commoditiesData.map(this.createCommOptions);
    const geogOptions = this.props.geographiesData.map(this.createGeogOptions);
    const titleOptions = this.props.titlesData.map(this.createTitleOptions);
    const hiddenAccess =
      this.props.currentUser.org_status === 1 && this.props.currentUser.user_status_id === 1
        ? 'hidden'
        : '';
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

        <h2 className="section-title-normal">User Profile</h2>

        <div className="flex-grid space-between align-center">
          <h3 className="section-title-normal">Contact Information</h3>
          <GfwButton classNames="btn-green" onClick={this.back} value="Back to Profile Manager" />
        </div>

        <section className="section-container">
          <div className="flex-grid-thirds">
            <div className="col">
              <div className="flex-grid-column">
                <div className="col flex-grid-column">
                  <span className="profile-label">First Name</span>
                  <input
                    value={this.state.first_name}
                    disabled={this.props.disable}
                    required
                    id="organization"
                    name="user_first_name"
                    onChange={this.updateFirst}
                  />
                </div>
              </div>
              <div className="flex-grid-column">
                <div className="col flex-grid-column">
                  <span className="profile-label">Last Name</span>
                  <input
                    value={this.state.last_name}
                    disabled={this.props.disable}
                    required
                    id="organization"
                    name="user_last_name"
                    onChange={this.updateLastName}
                  />
                </div>
              </div>
              <div className="flex-grid-column">
                <div className="col flex-grid-column">
                  <span className="profile-label">E-mail</span>
                  <input
                    value={this.state.email}
                    disabled={this.props.disable}
                    required
                    name="user_email"
                    onChange={this.updateEmail}
                  />
                </div>
              </div>
            </div>
            <div className="col">
              <div className="flex-grid-column">
                <div className="col flex-grid-column">
                  <label className="profile-label">Current User Status</label>
                  <select
                    value={this.state.status_id}
                    disabled={true}
                    required
                    name="user_status"
                    onChange={this.statusChange}
                    ref="statusSelect"
                  >
                    {statusOptions}
                  </select>
                </div>
              </div>
              <div className="flex-grid-column">
                <div className="col flex-grid-column">
                  <span className="profile-label">Phone</span>
                  <input
                    value={this.state.phone}
                    disabled={this.props.disable}
                    required
                    name="user_phone"
                    onChange={this.updatePhone}
                  />
                </div>
              </div>
            </div>
            <div className="col"></div>
          </div>
        </section>

        <section className="section-container">
          <h3 className="section-title-normal">Profile Information</h3>
          <section className="section-container">
            <div className="flex-grid-thirds">
              <div className="col">
                <div className="flex-grid-column">
                  <div className="col flex-grid-column">
                    <span className="profile-label">Access Level</span>
                    <select
                      value={this.state.access_level_id}
                      disabled={this.props.disable}
                      required
                      name="access_status"
                      onChange={this.accessChange}
                      ref="accessSelect"
                    >
                      {accessOptions}
                    </select>
                  </div>
                </div>
                <div className="flex-grid-column">
                  <div className="col flex-grid-column">
                    <span className="profile-label">Title</span>
                    <select
                      value={this.state.title}
                      disabled={this.props.disable}
                      required
                      name="user_title_id"
                      ref="titleSelect"
                      onChange={this.titleChange}
                    >
                      {titleOptions}
                    </select>
                  </div>
                  <div className={`account-info-item ${this.state.title === 10 ? '' : 'hidden'}`}>
                    <span className="account-info-label">Alternative Title</span>
                    <input
                      required
                      name="alternative_title"
                      value={this.state.other_title}
                      onChange={this.handleOtherTitle}
                      className="account-info-input"
                    />
                  </div>
                </div>

                <div
                  className={`flex-grid-column ${
                    this.state.title === 10 || this.state.title === '10' ? '' : 'hidden'
                  }`}
                >
                  <div className="col flex-grid-column">
                    <span className="profile-label">Alternative Title</span>
                    <input
                      required
                      name="alternative_title"
                      value={this.state.other_title}
                      onChange={this.updateOther}
                      disabled={this.props.disable}
                    />
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="flex-grid-column">
                  <div className="col flex-grid-column">
                    <span className="profile-label">Geographies of Interest</span>
                    <Select
                      placeholder={profilePage.profileManager.multiselectPrompt}
                      isMulti={true}
                      isSearchable={true}
                      maxMenuHeight={150}
                      options={geogOptions}
                      id="arr_user_geography_ids"
                      onChange={this.geogChange}
                      value={this.state.geographies}
                      disabled={this.props.disable}
                      name="arr_user_geography_ids"
                    />
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="flex-grid-column">
                  <div className="col flex-grid-column">
                    <span className="profile-label">Commodities of Interest</span>
                    <Select
                      placeholder={profilePage.profileManager.multiselectPrompt}
                      isMulti={true}
                      isSearchable={true}
                      maxMenuHeight={150}
                      options={commOptions}
                      name="arr_user_commodity_ids"
                      onChange={this.commChange}
                      value={this.state.commodities}
                      disabled={this.props.disable}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>

        <section className="section-container">
          <h3 className="section-title-normal">Alerts Email Notifications Preferences</h3>
          <section className="section-container">
            <input
              id="EnableEmailAlertNotificationsManager"
              checked={this.state.enableAlerts}
              disabled={this.props.disable}
              type="checkbox"
              name="email_preferences"
              onChange={this.updateEmailPrefs}
            />
            <label
              htmlFor="EnableEmailAlertNotificationsManager"
              className={`profile-label ${this.props.disable ? 'disabled' : null}`}
            >
              Enable Email Alert Notifications
            </label>
            <div className={`space-element ${this.state.enableAlerts ? '' : 'hidden'}`}>
              <table>
                <tbody>
                  <tr>
                    <td>VIIRS Active Fires Alerts</td>
                    {viirsOptions}
                  </tr>
                  <tr>
                    <td>GLAD Alerts</td>
                    {gladOptions}
                  </tr>
                  <tr>
                    <td>FORMA Alerts</td>
                    {formaOptions}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </section>

        <section className="section-container">
          <h3 className="section-title-normal">Second Level Authentication Preferences</h3>
          <span className="profile-label">
            Select your preferred method for account verification
          </span>
          <div className="flex-grid space-element">
            <input
              id="secondLevelAuthenticationEmail"
              type="radio"
              name="second-level-authentication"
              disabled={this.props.disable}
              checked={this.state.auth_preference_id === 0}
              onChange={this.updateAuthenticationPreference}
              value={0}
            />
            <label
              htmlFor="secondLevelAuthenticationEmail"
              className={`profile-label ${this.props.disable ? 'disabled' : null}`}
            >
              Email
            </label>
            <input
              type="radio"
              id="secondLevelAuthenticationGoogle"
              name="second-level-authentication"
              disabled={this.props.disable}
              checked={this.state.auth_preference_id === 1}
              onChange={this.updateAuthenticationPreference}
              value={1}
            />
            <label
              htmlFor="secondLevelAuthenticationGoogle"
              className={`profile-label ${this.props.disable ? 'disabled' : null}`}
            >
              Google Authenticator{' '}
            </label>
          </div>
          <div className={this.state.auth_preference_id === 1 ? 'flex-grid' : 'hidden'}>
            <div className="col">
              <div className="flex-grid-column">
                <div className="profile-label">
                  Open your Google Authenticator App and scan the image!
                </div>
                <img width="196" height="196" src={this.state.secret_url} />
              </div>
            </div>
            <div className="col">
              <div className="flex-grid-column">
                <div className="profile-label">Camera not working? Copy & paste the secret!</div>
                <input value={this.state.secret} name="user_secret" />
              </div>
            </div>
          </div>
        </section>

        <div className="profile-button-container justify-end">
          {this.props.userOnly ? null : (
            <GfwButton classNames="btn-green" onClick={this.back} value="Cancel" />
          )}
          {this.props.userOnly ? null : (
            <GfwButton
              classNames={`btn-green ${this.state.status_id === 2 ? 'button-disabled' : ''}`}
              disabled={this.state.status_id === 2}
              onClick={this.activateUser}
              value="Activate"
            />
          )}

          {this.props.userOnly ? null : (
            <GfwButton
              classNames={`btn-green ${this.state.status_id === 3 ? 'button-disabled' : ''}`}
              disabled={this.state.status_id === 3}
              onClick={this.deactivateUser}
              value="Deactivate"
            />
          )}
          <GfwButton
            classNames={`btn-green ${this.props.disable ? 'button-disabled' : ''}`}
            disabled={this.props.disable}
            onClick={this.updateUser}
            value="Save"
          />
        </div>
      </div>
    );
  }
}
