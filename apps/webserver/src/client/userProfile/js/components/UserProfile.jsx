/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-return-assign */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/sort-comp */
/* eslint-disable array-callback-return */
/* eslint-disable camelcase */
import React, { Component } from 'react';
import qr from 'qrcode';
import Dialog from 'material-ui/Dialog';
import Select from 'react-select';
import fetch from '../../../common/js/utils/fetch';
import { fieldValidations } from '../../../profile/js/utils/validations';
import {
  addUser,
  changeUser,
  updateUser,
  updateCurrentUser,
} from '../../../profile/js/actions/profileActions';
import { profilePage, authMessages } from '../../../common/js/config';
import httpRequest from '../../../common/js/utils/httpRequest';
import Button from '../../../common/js/components/Button';
import GfwSelect from '../../../common/js/components/GfwSelect';
import ModalLoader from '../../../common/js/components/Loaders/ModalLoader';
import IconArrowLeft from '../../../common/js/components/icon/IconArrowLeft';
import LinkButton from '../../../common/js/components/LinkButton';
import store from '../../../profile/js/store';
import '../../css/userProfile.scss';

export default class UserProfile extends Component {
  constructor(props) {
    super(props);

    const { titlesData, currentUser } = this.props;

    const dropdownTitleOptions = (titlesDataLocal) => {
      return titlesDataLocal.map((data) => {
        return {
          value: data.id,
          label: data.title,
        };
      });
    };

    const dropdownAccessLevelOptions = (accessLevelDataLocal) => {
      return accessLevelDataLocal.map((data) => {
        return {
          value: data.id,
          label: data.name,
        };
      });
    };

    // status
    const statusData = profilePage.userProfile.statusOptions;

    const dropdownUserStatusOptions = (statusDataLocal) => {
      return statusDataLocal.map((data) => {
        return {
          value: data.id,
          label: data.name,
        };
      });
    };

    const newUser = !currentUser.email;
    const accessLevelData = profilePage.userProfile.accessOptions;

    const geographyArray = props.currentUser.user_geography_ids
      ? props.currentUser.user_geography_ids.split(',').map((geog) => {
          return parseInt(geog, 10);
        })
      : [];

    const geographies =
      props.geographiesData && props.geographiesData.length
        ? geographyArray.map((g) => {
            const datum = props.geographiesData.find((d) => d.id === g);
            return datum
              ? { label: datum.geography_name, value: datum.id }
              : { label: '', value: g };
          })
        : [];

    const commodityArray = props.currentUser.user_commodity_ids
      ? props.currentUser.user_commodity_ids.split(',').map((comm) => {
          return parseInt(comm, 10);
        })
      : [];

    const commodities =
      props.commoditiesData && props.commoditiesData.length
        ? commodityArray.map((c) => {
            const datum = props.commoditiesData.find((d) => d.id === c);
            // Note that 'commodity' is misspelled with 3 m's in the user profile data from the API
            return datum
              ? { label: datum.commmodity_name, value: datum.id }
              : { label: '', value: c };
          })
        : [];

    this.state = {
      newUser,
      // USER PROFILE STATE
      id: currentUser.user_id ?? currentUser.id ?? '',
      first_name: currentUser.first_name ? currentUser.first_name : '',
      middle_initial: currentUser.middle_initial ? currentUser.middle_initial : '',
      last_name: currentUser.last_name ? currentUser.last_name : '',
      email: currentUser.email ? currentUser.email : '',
      phone: currentUser.phone ? currentUser.phone : '',
      title_id: currentUser.title_id ? currentUser.title_id : 1,
      other_title: currentUser.other_title ? currentUser.other_title : '',
      access_level_id: currentUser.access_level_id ? currentUser.access_level_id : 1,
      status_id: currentUser.status_id ? currentUser.status_id : 1,
      enableAlerts: false,
      geographies,
      commodities,
      viirsAlerts: currentUser.viirs_email_frequency ? currentUser.viirs_email_frequency : 0,
      gladAlerts: currentUser.glad_email_frequency ? currentUser.glad_email_frequency : 0,
      granChacoAlerts: currentUser.gran_chaco_email_frequency
        ? currentUser.gran_chaco_email_frequency
        : 0,
      auth_preference_id: currentUser.auth_preference_id ? currentUser.auth_preference_id : 0,
      // UI STATE
      dialogOpen: false,
      dialogTitle: '',
      dialogMessage: '',
      sharingInternal: 0,
      sharingExternal: 0,
      showModalLoader: false,
      dropdownTitleOptions: dropdownTitleOptions(titlesData),
      dropdownAccessLevelOptions: dropdownAccessLevelOptions(accessLevelData),
      dropdownUserStatusOptions: dropdownUserStatusOptions(statusData),
      selectedDropdownTitleOption: this.getUserTitle(currentUser.title_id, this.props.titlesData),
      selectedDropdownAccessLevelOption: this.getUserAccessLevel(
        currentUser.access_level_id,
        accessLevelData
      ),
      selectedDropdownUserStatusOption: this.getUserStatus(currentUser.status_id, statusData),
    };

    // Get the user QR Code
    if (currentUser.email && newUser === false && currentUser.auth_preference_id === 1) {
      this.getQRCode();
    }
  }

  getUserTitle = (titleId, titlesData) => {
    if (parseInt(titleId, 10)) {
      const userTitle = titlesData.filter((title) => {
        return parseInt(titleId, 10) === parseInt(title.id, 10);
      })[0];
      const userTitleObj = {
        value: userTitle.id,
        label: userTitle.title,
      };
      return userTitleObj;
    }
    return 'Select...';
  };

  getUserAccessLevel = (accessLevelId, accessLevelDataLocal) => {
    if (parseInt(accessLevelId, 10)) {
      const userAccessLevel = accessLevelDataLocal.filter((accessLevel) => {
        return parseInt(accessLevelId, 10) === parseInt(accessLevel.id, 10);
      })[0];
      const userAccessLevelObj = {
        value: userAccessLevel.id,
        label: userAccessLevel.name,
      };
      return userAccessLevelObj;
    }
    return 'Select...';
  };

  getUserStatus = (statusId, statusDataLocal) => {
    if (parseInt(statusId, 10)) {
      const userStatus = statusDataLocal.filter((status) => {
        return parseInt(statusId, 10) === parseInt(status.id, 10);
      })[0];
      const userStatusObj = {
        value: userStatus.id,
        label: userStatus.name,
        name: userStatus.name,
      };
      return userStatusObj;
    }
    return 'Active';
  };

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
    const { email } = this.state;
    xmlhttp.send(JSON.stringify({ email }));
  };

  activateUser = () => {
    const { id, email, first_name, last_name } = this.state;
    this.setState({ showModalLoader: true }, () => {
      httpRequest
        .fetchJSON('/profile/activateUser', {
          id,
          email,
          first_name,
          last_name,
        })
        .then(() => {
          this.setState(
            {
              showModalLoader: false,
            },
            () => {
              this.setState(
                {
                  dialogOpen: true,
                  dialogTitle: 'User activated',
                  dialogMessage: `The user ${first_name} ${last_name} has been successfully activated.`,
                  status_id: 2,
                },
                () => {
                  const userObject = {
                    user_id: id,
                    status_id: 2,
                    activated_time: new Date(),
                  };
                  store.dispatch(updateUser(userObject));
                }
              );
            }
          );
        });
    });
  };

  deactivateUser = () => {
    const { users, userInfo } = this.props;
    const { access_level_id, id, email, first_name, last_name } = this.state;
    // Determine if the current user is an admin
    const isAdmin = access_level_id === 1;
    // Determine if the current logged user is attempting to deactivate themselves
    const isSelf = userInfo.id === id;
    // Determine the number of admins in the organization
    const numberOfOrgAdmins = users.filter(
      (user) => user.access_level_id === 1 && user.status_id === 2
    ).length;

    if (numberOfOrgAdmins <= 1 && isAdmin) {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Unable to deactivate user',
        dialogMessage:
          'Deactivating this user will leave the organization without an administrator.',
        updating: false,
      });
    } else if (isSelf && isAdmin) {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Unable to deactivate user',
        dialogMessage: 'You are not allowed to deactivate yourself as an administrator.',
        updating: false,
      });
    } else {
      this.setState({ showModalLoader: true }, () => {
        httpRequest
          .fetchJSON('/profile/deactivateUser', {
            name: id,
            email,
          })
          .then(() => {
            this.setState(
              {
                showModalLoader: false,
                status_id: 3,
                dialogOpen: true,
                dialogTitle: 'User deactivated',
                dialogMessage: `The user ${first_name} ${last_name} has been successfully deactivated.`,
                updating: false,
              },
              () => {
                store.dispatch(
                  updateUser({
                    user_id: id,
                    status_id: 3,
                  })
                );
              }
            );
          });
      });
    }
  };

  updateUser = () => {
    const errors = [];
    const missing = [];
    const { first_name, last_name, email, phone, newUser, id } = this.state;
    fieldValidations.first_name.validations.forEach((validation) => {
      if (validation(first_name) === false) {
        errors.push(fieldValidations.first_name.text);
      }
    });
    fieldValidations.first_name.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(first_name) === false) {
        missing.push(fieldValidations.first_name.text);
      }
    });

    fieldValidations.last_name.validations.forEach((validation) => {
      if (validation(last_name) === false) {
        errors.push(fieldValidations.last_name.text);
      }
    });
    fieldValidations.last_name.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(last_name) === false) {
        missing.push(fieldValidations.last_name.text);
      }
    });

    fieldValidations.email.validations.forEach((validation) => {
      if (validation(email) === false) {
        errors.push(fieldValidations.email.text);
      }
    });
    fieldValidations.email.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(email) === false) {
        missing.push(fieldValidations.email.text);
      }
    });

    fieldValidations.phone.validations.forEach((validation) => {
      if (validation(phone) === false) {
        errors.push(fieldValidations.phone.text);
      }
    });
    fieldValidations.phone.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(phone) === false) {
        missing.push(fieldValidations.phone.text);
      }
    });

    if (errors.length === 0 && missing.length === 0) {
      const url = newUser ? '/profile/createuser' : '/profile/updateuser';
      const method = 'POST';
      const headers = { 'Content-Type': 'application/json' };
      const body = { ...this.state };
      body.geographies = body.geographies.map((g) => g.value);
      body.commodities = body.commodities.map((c) => c.value);
      this.setState(
        {
          showModalLoader: true,
          updating: true,
        },
        () => {
          fetch({ url, method, headers, body }).then((response) => {
            this.setState(
              {
                showModalLoader: false,
              },
              () => {
                const { errorCode } = response;
                if (errorCode) {
                  this.setState({
                    dialogOpen: true,
                    dialogTitle: newUser ? 'User not added' : 'User not updated',
                    dialogMessage: newUser
                      ? response.userMessage
                      : 'Please contact system administrator for more information.',
                    updating: false,
                  });
                } else {
                  this.setState(
                    {
                      id: url === '/profile/createuser' ? response.user_id : id,
                      newUser: false,
                      updating: true,
                    },
                    () => {
                      const {
                        geographies,
                        commodities,
                        access_level_id,
                        activated_time,
                        auth_preference_id,
                        middle_initial,
                        other_title,
                        status_id,
                        title_id,
                      } = this.state;
                      const geographyIds = geographies.map((g) => g.value).join(',');
                      const commodityIds = commodities.map((g) => g.value).join(',');
                      const userObject = {
                        access_level_id,
                        activated_time:
                          typeof activated_time === 'object' ? activated_time : new Date(),
                        auth_preference_id,
                        email,
                        email_subscription: false,
                        first_name,
                        forma_email_frequency: 0,
                        glad_email_frequency: 0,
                        gran_chaco_email_frequency: 0,
                        last_name,
                        middle_initial: middle_initial || '',
                        other_title,
                        phone,
                        status_id: url === '/profile/createuser' ? 1 : status_id,
                        title_id,
                        user_commodity_ids: commodityIds,
                        user_geography_ids: geographyIds,
                        user_id: id === '' ? response.user_id : id,
                        viirs_email_frequency: 0,
                      };
                      if (url === '/profile/createuser') {
                        store.dispatch(addUser(userObject));
                        store.dispatch(changeUser(userObject));
                      } else {
                        store.dispatch(updateUser(userObject));
                        store.dispatch(updateCurrentUser(userObject));
                      }
                    }
                  );
                }
              }
            );
          });
        }
      );
    } else if (errors.length > 0 && missing.length > 0) {
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
  };

  // Function to request reset User's password via Admin role only
  adminResetPassword = () => {
    this.setState({ showModalLoader: true }, () => {
      const { email } = this.state;
      httpRequest.fetchJSON('/auth/admin-reset-user-password', { email }).then((response) => {
        let res;
        try {
          res = JSON.parse(response);
        } catch {
          res = null;
        }
        if (res) {
          if (
            Object.prototype.hasOwnProperty.call(res, 'systemMessage') &&
            res.systemMessage.code === 'LimitExceededException'
          ) {
            this.setState({
              showModalLoader: false,
              dialogOpen: true,
              dialogTitle: authMessages.resetLimit.title,
              dialogMessage: authMessages.resetLimit.message,
            });
          } else if (
            Object.prototype.hasOwnProperty.call(res, 'message') &&
            res.message === 'Success'
          ) {
            this.setState({
              showModalLoader: false,
              dialogOpen: true,
              dialogTitle: authMessages.resetSuccess.title,
              dialogMessage: authMessages.resetSuccess.message,
            });
          }
        } else {
          this.setState({
            dialogOpen: true,
            dialogTitle: authMessages.resetError.title,
            dialogMessage: authMessages.resetError.message,
          });
        }
      });
    });
  };

  back = () => {
    window.location.href = '/profile';
  };

  generateMessages = (message, i) => {
    return <p key={message + i}>{message}</p>;
  };

  handleDropdownTitleSelection = (evt) => {
    const { dropdownTitleOptions } = this.state;
    const selectedDropdownTitleOption = dropdownTitleOptions.filter((option) => {
      if (option.value === parseInt(evt.value, 10)) {
        return option.label;
      }
    })[0];
    this.setState({
      selectedDropdownTitleOption,
      title_id: parseInt(evt.value, 10),
    });
  };

  handleDropdownAccessLevelSelection = (evt) => {
    const { dropdownAccessLevelOptions } = this.state;
    const selectedDropdownAccessLevelOption = dropdownAccessLevelOptions.filter((option) => {
      if (option.value === parseInt(evt.value, 10)) {
        return option.label;
      }
    })[0];

    this.setState({
      selectedDropdownAccessLevelOption,
      access_level_id: parseInt(evt.value, 10),
    });
  };

  // Event handler for authentication preference radio inputs
  updateAuthenticationPreference = (evt) => {
    const { auth_preference_id } = this.state;
    this.setState(
      {
        auth_preference_id: parseInt(evt.target.value, 10),
      },
      () => {
        // If the preference is Google Authenticator - get secret information
        if (auth_preference_id === 1) {
          this.getQRCode();
        }
      }
    );
  };

  handleGeographiesChange = (results) => {
    this.setState({ geographies: results });
  };

  handleCommoditiesChange = (results) => {
    this.setState({ commodities: results });
  };

  // STATUS_ID, ACCESS_LEVEL_ID

  createGeogOptions = (option) => {
    return { label: option.geography_name, value: option.id };
  };

  createCommOptions = (option) => {
    return { label: option.commmodity_name, value: option.id };
  };

  closeDialog = () => {
    this.setState({ dialogOpen: false });
  };

  render() {
    const { userOnly, commoditiesData, geographiesData, userInfo } = this.props;

    const {
      newUser,
      // USER PROFILE STATE
      first_name,
      last_name,
      email,
      phone,
      title_id,
      other_title,
      status_id,
      geographies,
      commodities,
      auth_preference_id,
      // UI STATE
      dialogOpen,
      dialogTitle,
      dialogMessage,
      // sharingInternal,
      // sharingExternal,
      secret,
      secret_url,
      showModalLoader,
      updating,
      selectedDropdownUserStatusOption,
      selectedDropdownAccessLevelOption,
      dropdownAccessLevelOptions,
      selectedDropdownTitleOption,
      dropdownTitleOptions,
    } = this.state;
    // Handle dialog content
    const dialogContent =
      typeof dialogMessage === 'string' ? dialogMessage : dialogMessage.map(this.generateMessages);
    const geographyOptions = geographiesData.map(this.createGeogOptions);
    const commodityOptions = commoditiesData.map(this.createCommOptions);

    const defaultAction = updating
      ? []
      : [<Button variant="primary" label="OK" keyboardFocused onClick={this.closeDialog} />];

    return (
      <div id="Profile__UserProfile" className="user-profile-page">
        <ModalLoader open={showModalLoader} />

        <Dialog
          paperClassName="dialog-paper"
          open={dialogOpen}
          title={dialogTitle}
          actions={defaultAction}
          onRequestClose={this.closeDialog}
        >
          {dialogContent}
        </Dialog>

        <div className={`${userOnly ? 'hidden' : ''}`}>
          <LinkButton
            className="profile-page__back-button back-button"
            onClick={this.back}
            icon={<IconArrowLeft height="10px" />}
            label={profilePage.profileManager.backButton}
          />
        </div>

        <h1 className="profile-page__title">{profilePage.profileManager.userProfileTitle}</h1>

        <h2 className="profile-page__subheader">
          {profilePage.profileManager.userContactInfoTitle}
        </h2>
        <p className={`${newUser ? '' : 'hidden'}`}>
          {profilePage.profileManager.userProfilePrompt}
        </p>

        <section className="section-container">
          <div className="input-field__block-container">
            <label htmlFor="user_first_name" className="block-label required-param">
              {profilePage.profileManager.userContactFields[0]}
            </label>
            <input
              id="user_first_name"
              value={first_name}
              required
              name="user_first_name"
              readOnly={userOnly}
              onChange={(evt) => this.setState({ first_name: evt.target.value })}
            />
          </div>

          <div className="input-field__block-container">
            <label htmlFor="user_last_name" className="block-label required-param">
              {profilePage.profileManager.userContactFields[1]}
            </label>
            <input
              value={last_name}
              required
              id="user_last_name"
              name="user_last_name"
              readOnly={userOnly}
              onChange={(evt) => this.setState({ last_name: evt.target.value })}
            />
          </div>

          <div className="input-field__block-container">
            <label htmlFor="user_email" className="block-label required-param">
              {profilePage.profileManager.userContactFields[2]}
            </label>
            <input
              value={email}
              required
              id="user_email"
              name="user_email"
              readOnly={!newUser}
              onChange={(evt) =>
                this.setState({ email: evt.target.value.toString().toLowerCase() })
              }
            />
          </div>

          <div className="input-field__block-container">
            <label htmlFor="current_user_status" className="block-label">
              {profilePage.profileManager.userContactFields[3]}
            </label>
            <input
              id="current_user_status"
              name="current_user_status"
              readOnly
              value={selectedDropdownUserStatusOption.name}
            />
          </div>

          <div className="input-field__block-container">
            <label htmlFor="user_phone" className="block-label required-param">
              {profilePage.profileManager.userContactFields[4]}
            </label>
            <input
              value={phone}
              required
              id="user_phone"
              name="user_phone"
              onChange={(evt) => this.setState({ phone: evt.target.value })}
            />
          </div>
        </section>

        <section className="section-container">
          <h2 className="profile-page__subheader">
            {profilePage.profileManager.userProfileInfoTitle}
          </h2>

          <section className="section-container">
            <div className="input-field__block-container">
              {userInfo.access_level_id === 1 ? (
                <>
                  <label htmlFor="access-level-select" className="block-label required-param">
                    {profilePage.profileManager.userProfileFields[0]}
                  </label>
                  <GfwSelect
                    value={selectedDropdownAccessLevelOption}
                    options={dropdownAccessLevelOptions}
                    onChange={(evt) => this.handleDropdownAccessLevelSelection(evt)}
                    id="access-level-select"
                    required
                  />
                </>
              ) : (
                <>
                  <label htmlFor="access_level" className="block-label required-param">
                    {profilePage.profileManager.userProfileFields[0]}
                  </label>
                  <input
                    id="access_level"
                    name="access_level"
                    readOnly={userOnly}
                    value={
                      selectedDropdownAccessLevelOption.label || selectedDropdownAccessLevelOption
                    }
                  />
                </>
              )}
            </div>

            <div className="input-field__block-container">
              <label htmlFor="title-select" className="block-label required-param">
                {profilePage.profileManager.userProfileFields[1]}
              </label>
              <GfwSelect
                value={selectedDropdownTitleOption}
                options={dropdownTitleOptions}
                onChange={(evt) => this.handleDropdownTitleSelection(evt)}
                id="title-select"
                required
              />
            </div>

            <div className={`${title_id === 10 ? 'col flex-grid-column' : 'hidden'}`}>
              <label className="profile-label" htmlFor="userPhone">
                Alternative Title
              </label>
              <input
                value={other_title}
                required
                name="user_phone"
                onChange={(evt) => this.setState({ other_title: evt.target.value })}
              />
            </div>

            <div className="input-field__block-container">
              <label htmlFor="geogSelect" className="block-label">
                {profilePage.profileManager.userProfileFields[5]}
              </label>
              <Select
                id="geogSelect"
                name="arr_user_geography_ids"
                options={geographyOptions}
                maxMenuHeight={150}
                onChange={this.handleGeographiesChange}
                isMulti
                isSearchable
                placeholder={profilePage.profileManager.multiselectPrompt}
                value={geographies}
              />
            </div>

            <div className="input-field__block-container">
              <label htmlFor="commSelect" className="block-label">
                {profilePage.profileManager.userProfileFields[6]}
              </label>
              <Select
                id="commSelect"
                name="arr_user_commodity_ids"
                options={commodityOptions}
                maxMenuHeight={150}
                onChange={this.handleCommoditiesChange}
                isMulti
                isSearchable
                placeholder={profilePage.profileManager.multiselectPrompt}
                value={commodities}
              />
            </div>
          </section>
        </section>

        <section className="section-container">
          <h2 className="profile-page__subheader">
            {profilePage.profileManager.userSecondLevelTitle}
          </h2>
          <p className="profile-label">{profilePage.profileManager.userSecondLevelPrompt}</p>

          <div className="flex-grid space-element">
            <input
              type="radio"
              id="secondLevelAuthenticationEmail"
              name="second-level-authentication"
              checked={auth_preference_id === 0}
              onChange={this.updateAuthenticationPreference}
              value={0}
            />
            <label htmlFor="secondLevelAuthenticationEmail" className="block-label">
              {profilePage.profileManager.secondLevelFields[0]}
            </label>
            <input
              type="radio"
              id="secondLevelAuthenticationGoogle"
              name="second-level-authentication"
              checked={auth_preference_id === 1}
              onChange={this.updateAuthenticationPreference}
              value={1}
            />
            <label htmlFor="secondLevelAuthenticationGoogle" className="block-label">
              {profilePage.profileManager.secondLevelFields[1]}
            </label>
          </div>
          <div className={auth_preference_id === 1 ? 'flex-grid' : 'hidden'}>
            <div className="col">
              <div className="flex-grid-column">
                <label className="block-label" htmlFor="secretImage">
                  {profilePage.profileManager.googleVerifyPrompt}
                </label>
                <img width="196" height="196" src={secret_url} />
              </div>
            </div>
            <div className="col">
              <div className="flex-grid-column">
                <label htmlFor="user_secret" className="block-label">
                  {profilePage.profileManager.googleSecretPrompt}
                </label>
                <input id="user_secret" value={secret} name="user_secret" />
              </div>
            </div>
          </div>
        </section>

        <div className="profile-button-container justify-end">
          {/* status_id === 2 is active user */}

          <Button
            variant="primary"
            onClick={this.updateUser}
            label={profilePage.profileManager.save}
          />

          {userOnly ? null : (
            <Button onClick={this.back} label={profilePage.profileManager.cancel} />
          )}

          {userOnly || newUser ? null : (
            <Button
              variant="primary"
              className={`${status_id === 2 ? 'button-disabled' : ''}`}
              disabled={status_id === 2}
              onClick={this.activateUser}
              label={profilePage.profileManager.activate}
            />
          )}

          {(userOnly || userInfo.email === email) && !newUser ? (
            <Button
              onClick={() => (window.location.href = '/changeExist')}
              label={profilePage.profileManager.changePassword}
            />
          ) : null}

          {userOnly ||
          newUser ||
          !(status_id === 2) ||
          (userInfo.email === email && !newUser) ? null : (
            <Button
              onClick={this.adminResetPassword}
              label={profilePage.profileManager.resetPassword}
            />
          )}

          {userOnly || newUser ? null : (
            <Button
              variant="danger"
              className={`${status_id === 3 ? 'button-disabled' : ''}`}
              disabled={status_id === 3}
              onClick={this.deactivateUser}
              label={profilePage.profileManager.deactivate}
            />
          )}
        </div>
      </div>
    );
  }
}
