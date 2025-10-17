import { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import qr from 'qrcode';
import Dialog from 'material-ui/Dialog';
import { Divider } from '@mui/material';

import fetch from '../../../common/js/utils/fetch';
import { fieldValidations } from '../../../profile/js/utils/validations';
import {
  addUser,
  changeUser,
  updateUser,
  updateCurrentUser,
} from '../../../profile/js/actions/profileActions'; 

import { USER_STATUS, USER_STATUS_LABELS } from '../../../../config/env/userStatuses.constants';

import { profilePage } from '../../../common/js/config';
import httpRequest from '../../../common/js/utils/httpRequest';
import Button from '../../../common/js/components/Button';
import GfwSelect from '../../../common/js/components/GfwSelect';
import ModalLoader from '../../../common/js/components/Loaders/ModalLoader';
import IconArrowLeft from '../../../common/js/components/icon/IconArrowLeft';
import LinkButton from '../../../common/js/components/LinkButton';
import store from '../../../profile/js/store';
import '../../css/userProfile.scss';
import forgotStrings from '../../../forgot/js/components/forgotStrings';

export default function UserProfile(props) {
  const { titlesData, currentUser, geographiesData, commoditiesData, userInfo, users, userOnly } =
    props;

  console.log('USER_STATUS_LABELS', USER_STATUS_LABELS);

  // Helper to validate a single field
  const validateField = (fieldValue, { validations, mandatoryChecks, text }) => {
    const errors = validations.filter((v) => !v(fieldValue)).map(() => text);
    const missing = mandatoryChecks.filter((m) => !m(fieldValue)).map(() => text);
    return { errors, missing };
  };

  // Helper transforms (kept similar to original)
  const dropdownTitleOptions = useCallback((titles) => {
    return (titles || []).map((data) => ({ value: data.id, label: data.title }));
  }, []);

  const buildAccessLevelOptions = useCallback((accessLevels) => {
    return (accessLevels || []).map((data) => ({ value: data.id, label: data.name }));
  }, []);

  const statusData = profilePage.userProfile.statusOptions;
  const dropdownUserStatusOptions = useCallback((statusArr) => {
    return (statusArr || []).map((s) => ({ value: s.id, label: s.name, name: s.name }));
  }, []);

  const accessLevelData = profilePage.userProfile.accessOptions;

  // Convert comma-separated ids into Select values
  const parseMultiIds = useCallback((csv) => {
    if (!csv) {
      return [];
    }
    return csv.split(',').map((v) => parseInt(v, 10));
  }, []);

  const buildSelectedMulti = useCallback((idsArray, sourceData, labelKey = 'geography_name') => {
    if (!sourceData || !sourceData.length) {
      return idsArray.map((id) => ({ label: '', value: id }));
    }
    return idsArray.map((id) => {
      const datum = sourceData.find((d) => d.id === id);
      return datum ? { label: datum[labelKey], value: datum.id } : { label: '', value: id };
    });
  }, []);

  // Initial derived values (mirrors constructor logic)
  const newUserInitial = !currentUser.email;
  const geographyArray = parseMultiIds(currentUser.user_geography_ids);
  const geographiesInitial =
    geographiesData && geographiesData.length
      ? buildSelectedMulti(geographyArray, geographiesData, 'geography_name')
      : [];

  const commodityArray = parseMultiIds(currentUser.user_commodity_ids);
  const commoditiesInitial =
    commoditiesData && commoditiesData.length
      ? buildSelectedMulti(commodityArray, commoditiesData, 'commmodity_name')
      : [];

  // Helper getters (converted from class methods)
  const getUserTitle = useCallback((titleId, titles) => {
    const parsed = parseInt(titleId, 10);
    if (parsed) {
      const userTitle = (titles || []).find((t) => parsed === parseInt(t.id, 10));
      if (userTitle) {
        return { value: userTitle.id, label: userTitle.title };
      }
    }
    return 'Select...';
  }, []);

  const getUserAccessLevel = useCallback((accessLevelId, accessLevelDataLocal) => {
    const parsed = parseInt(accessLevelId, 10);
    if (parsed) {
      const userAccessLevel = (accessLevelDataLocal || []).find(
        (a) => parsed === parseInt(a.id, 10)
      );
      if (userAccessLevel) {
        return { value: userAccessLevel.id, label: userAccessLevel.name };
      }
    }
    return 'Select...';
  }, []);

  const getUserStatus = useCallback((statusId, statusDataLocal) => {
    const parsed = parseInt(statusId, 10);
    if (parsed) {
      const userStatus = (statusDataLocal || []).find((s) => parsed === parseInt(s.id, 10));
      if (userStatus) {
        return {
          value: userStatus.id,
          label: userStatus.name,
          name: userStatus.name,
        };
      }
    }
    return USER_STATUS_LABELS[USER_STATUS.Active];
  }, []);

  const [state, setState] = useState(() => ({
    newUser: newUserInitial,
    id: currentUser.user_id ?? currentUser.id ?? '',
    first_name: currentUser.first_name ?? '',
    middle_initial: currentUser.middle_initial ?? '',
    last_name: currentUser.last_name ?? '',
    email: currentUser.email ?? '',
    phone: currentUser.phone ?? '',
    title_id: currentUser.title_id ?? 1,
    other_title: currentUser.other_title ?? '',
    access_level_id: currentUser.access_level_id ?? 1,
    status_id: currentUser.status_id ?? USER_STATUS.Pending,
    enableAlerts: false,
    geographies: geographiesInitial,
    commodities: commoditiesInitial,
    viirsAlerts: currentUser.viirs_email_frequency ?? 0,
    gladAlerts: currentUser.glad_email_frequency ?? 0,
    granChacoAlerts: currentUser.gran_chaco_email_frequency ?? 0,
    auth_preference_id: currentUser.auth_preference_id ?? 0,
    dialogOpen: false,
    dialogTitle: '',
    dialogMessage: '',
    sharingInternal: 0,
    sharingExternal: 0,
    showModalLoader: false,
    dropdownTitleOptions: dropdownTitleOptions(titlesData),
    dropdownAccessLevelOptions: buildAccessLevelOptions(accessLevelData),
    dropdownUserStatusOptions: dropdownUserStatusOptions(statusData),
    selectedDropdownTitleOption: getUserTitle(currentUser.title_id, titlesData),
    selectedDropdownAccessLevelOption: getUserAccessLevel(
      currentUser.access_level_id,
      accessLevelData
    ),
    selectedDropdownUserStatusOption: getUserStatus(currentUser.status_id, statusData),
    secret: '',
    secret_url: '',
    updating: false,
  }));

  // Small helper to update state
  const updateState = useCallback((patch) => setState((s) => ({ ...s, ...patch })), []);

  // QR Code fetch
  const getQRCode = useCallback(async () => {
    const { email } = state;
    if (!email) {
      return;
    }
    try {
      const response = await httpRequest.fetchJSON('/userSecret', { email });
      let parsed = null;
      try {
        parsed = JSON.parse(response);
      } catch {
        parsed = null;
      }
      if (parsed && parsed.url) {
        // qr.toDataURL returns a promise when not using callback
        qr.toDataURL(parsed.url)
        .then((dataUrl) => {
          updateState({ secret: parsed.secret, secret_url: dataUrl });
        })
        .catch(() => {
          // fallback: still updateState secret if QR fails
          updateState({ secret: parsed.secret, secret_url: '' });
        });
      }
    } catch (err) {
      // swallow errors but leave state consistent
      console.error('getQRCode error', err);
    }
  }, [state.email, updateState]);

  // If current user is not new and uses Google Auth (auth_preference_id === 1), get QR
  useEffect(() => {
    if (state.email && state.newUser === false && state.auth_preference_id === 1) {
      getQRCode();
    }
  }, [state.email, state.newUser, state.auth_preference_id, getQRCode]);

  // Activation
  const activateUser = useCallback(
    async (userId = null) => {
      const { email, first_name, last_name } = state;
      const id = userId || state.id;

      updateState({ showModalLoader: true });

      try {
        const response = await httpRequest.fetchJSON('/profile/activateUser', {
          id,
          email,
          first_name,
          last_name,
        });

        let parsedResponse;
        try {
          parsedResponse = JSON.parse(response);
        } catch {
          parsedResponse = null;
        }

        if (!parsedResponse) {
          updateState({
            showModalLoader: false,
            dialogOpen: true,
            dialogTitle: 'Error',
            dialogMessage: 'Activation failed: invalid server response.',
          });
          return;
        }

        const { errorCode, userMessage } = parsedResponse;

        if (errorCode) {
          updateState({
            showModalLoader: false,
            dialogOpen: true,
            dialogTitle: 'Error',
            dialogMessage: userMessage,
          });
        } else {
          updateState({
            showModalLoader: false,
            dialogOpen: true,
            dialogTitle: 'User activated',
            dialogMessage: `The user ${first_name} ${last_name} has been successfully activated.`,
            status_id: 2,
          });

          const userObject = { user_id: id, status_id: 2, activated_time: new Date() };
          store.dispatch(updateUser(userObject));
        }
      } catch (err) {
        updateState({
          showModalLoader: false,
          dialogOpen: true,
          dialogTitle: 'Error',
          dialogMessage: 'Activation failed.',
        });
      }
    },
    [state, updateState]
  );

  // Deactivation
  const deactivateUser = useCallback(() => {
    const { access_level_id, id, email, first_name, last_name } = state;
    const isAdmin = access_level_id === 1;
    const isSelf = userInfo.id === id;
    const numberOfOrgAdmins = (users || []).filter(
      (user) => user.access_level_id === 1 && user.status_id === 2
    ).length;

    if (numberOfOrgAdmins <= 1 && isAdmin) {
      updateState({
        dialogOpen: true,
        dialogTitle: 'Unable to deactivate user',
        dialogMessage:
          'Deactivating this user will leave the organization without an administrator.',
        updating: false,
      });
      return;
    }
    if (isSelf && isAdmin) {
      updateState({
        dialogOpen: true,
        dialogTitle: 'Unable to deactivate user',
        dialogMessage: 'You are not allowed to deactivate yourself as an administrator.',
        updating: false,
      });
      return;
    }

    updateState({ showModalLoader: true });
    httpRequest
      .fetchJSON('/profile/deactivateUser', { name: id, email })
      .then((response) => {
        const parsedResponse = JSON.parse(response);
        const { errorCode, userMessage } = parsedResponse;
        if (errorCode) {
          updateState({
            showModalLoader: false,
            dialogOpen: true,
            dialogTitle: 'Error',
            dialogMessage: userMessage,
          });
        } else {
          updateState({
            showModalLoader: false,
            status_id: 3,
            dialogOpen: true,
            dialogTitle: 'User deactivated',
            dialogMessage: `The user ${first_name} ${last_name} has been successfully deactivated.`,
            updating: false,
          });
          store.dispatch(updateUser({ user_id: id, status_id: 3 }));
        }
      })
      .catch(() => {
        updateState({
          showModalLoader: false,
          dialogOpen: true,
          dialogTitle: 'Error',
          dialogMessage: 'Deactivation failed.',
        });
      });
  }, [state, userInfo, users, updateState]);

  // Update/Create user
  const saveUser = useCallback(async () => {
    // Validate all fields
    const allErrors = [];
    const allMissing = [];
    ['first_name', 'last_name', 'email', 'phone'].forEach((key) => {
      const { errors, missing } = validateField(state[key], fieldValidations[key]);
      allErrors.push(...errors);
      allMissing.push(...missing);
    });

    // Handle validation feedback
    if (allErrors.length || allMissing.length) {
      if (allErrors.length && allMissing.length) {
        allErrors.unshift('Please review for invalid characters:');
        allMissing.unshift('Please enter:');
        updateState({
          dialogOpen: true,
          dialogTitle: 'Invalid field entries & Mandatory fields missing',
          dialogMessage: [...allErrors, ...allMissing],
          updating: false,
        });
      } else if (allErrors.length) {
        allErrors.unshift('Please review for invalid characters:');
        updateState({
          dialogOpen: true,
          dialogTitle: 'Invalid field entries',
          dialogMessage: allErrors,
          updating: false,
        });
      } else {
        allMissing.unshift('Please enter:');
        updateState({
          dialogOpen: true,
          dialogTitle: 'Mandatory fields missing',
          dialogMessage: allMissing,
          updating: false,
        });
      }
      return;
    }

    const { newUser, id } = state;
    const url = newUser ? '/profile/createuser' : '/profile/updateuser';
    const body = {
      ...state,
      geographies: (state.geographies || []).map((g) => g.value),
      commodities: (state.commodities || []).map((c) => c.value),
    };
    const headers = { 'Content-Type': 'application/json' };
    updateState({ showModalLoader: true, updating: true });

    try {
      const response = await fetch({ url, method: 'POST', headers, body });
      updateState({ showModalLoader: false });

      if (response.errorCode) {
        updateState({
          dialogOpen: true,
          dialogTitle: newUser ? 'User not added' : 'User not updated',
          dialogMessage: newUser
            ? response.userMessage
            : 'Please contact system administrator for more information.',
          updating: false,
        });
        return;
      }

      const userId = newUser ? response.user_id : id;
      updateState({ id: userId, newUser, updating: true });

      // Construct user object
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
      } = state;

      const userObject = {
        access_level_id,
        activated_time: typeof activated_time === 'object' ? activated_time : new Date(),
        auth_preference_id,
        email: state.email,
        email_subscription: false,
        first_name: state.first_name,
        forma_email_frequency: 0,
        glad_email_frequency: 0,
        gran_chaco_email_frequency: 0,
        last_name: state.last_name,
        middle_initial: middle_initial || '',
        other_title,
        phone: state.phone,
        status_id: newUser ? USER_STATUS.Pending : status_id,
        title_id,
        user_commodity_ids: (commodities || []).map((c) => c.value).join(','),
        user_geography_ids: (geographies || []).map((g) => g.value).join(','),
        user_id: userId,
        viirs_email_frequency: 0,
      };

      if (newUser) {
        store.dispatch(addUser(userObject));
        store.dispatch(changeUser(userObject));
        await activateUser(userId);
      } else {
        store.dispatch(updateUser(userObject));
        store.dispatch(updateCurrentUser(userObject));
      }
    } catch (err) {
      updateState({
        dialogOpen: true,
        dialogTitle: 'Error',
        dialogMessage: 'Request failed.',
        showModalLoader: false,
        updating: false,
      });
    }
  }, [state, updateState, activateUser]);

  const adminResetPassword = useCallback(async () => {
    const { email } = state;
    updateState({ showModalLoader: true });

    try {
      const response = await httpRequest.fetchJSON('/auth/admin-reset-user-password', { email });
      let res;

      try {
        res = JSON.parse(response);
      } catch {
        res = null;
      }

      if (res) {
        if (res.systemMessage?.code === 'LimitExceededException') {
          updateState({
            showModalLoader: false,
            dialogOpen: true,
            dialogTitle: forgotStrings.resetLimit.title,
            dialogMessage: forgotStrings.resetLimit.message,
          });
        } else if (res.message === 'Success') {
          updateState({
            showModalLoader: false,
            dialogOpen: true,
            dialogTitle: forgotStrings.resetSuccess.title,
            dialogMessage: forgotStrings.resetSuccess.message,
          });
        } else {
          updateState({
            showModalLoader: false,
            dialogOpen: true,
            dialogTitle: forgotStrings.resetError.title,
            dialogMessage: forgotStrings.resetError.message,
          });
        }
      } else {
        updateState({
          showModalLoader: false,
          dialogOpen: true,
          dialogTitle: forgotStrings.resetError.title,
          dialogMessage: forgotStrings.resetError.message,
        });
      }
    } catch {
      updateState({
        showModalLoader: false,
        dialogOpen: true,
        dialogTitle: forgotStrings.resetError.title,
        dialogMessage: forgotStrings.resetError.message,
      });
    }
  }, [state.email, updateState]);

  // Navigation back
  const navigateBack = useCallback(() => {
    window.location.href = '/profile';
  }, []);

  // Messages array mapping for dialog
  const generateMessages = useCallback(
    (message, i) => <p key={`${message}-${i}`}>{message}</p>,
    []
  );

  // Dropdown handlers
  const handleDropdownTitleSelection = useCallback(
    (evt) => {
      const { dropdownTitleOptions } = state;
      const selectedDropdownTitleOption = (dropdownTitleOptions || []).find(
        (option) => option.value === parseInt(evt.value, 10)
      );
      updateState({ selectedDropdownTitleOption, title_id: parseInt(evt.value, 10) });
    },
    [state, updateState]
  );

  const handleDropdownAccessLevelSelection = useCallback(
    (evt) => {
      const { dropdownAccessLevelOptions } = state;
      const selectedDropdownAccessLevelOption = (dropdownAccessLevelOptions || []).find(
        (option) => option.value === parseInt(evt.value, 10)
      );
      updateState({ selectedDropdownAccessLevelOption, access_level_id: parseInt(evt.value, 10) });
    },
    [state, updateState]
  );

  // Authentication preference radio
  const updateAuthenticationPreference = useCallback(
    (evt) => {
      const newPref = parseInt(evt.target.value, 10);
      // set to new preference first, then if Google Authenticator call getQRCode
      updateState({ auth_preference_id: newPref });
      // If the preference is Google Authenticator - get secret information
      if (newPref === 1) {
        // call getQRCode with current email
        getQRCode();
      }
    },
    [getQRCode, updateState]
  );

  // Multi select handlers
  const handleGeographiesChange = useCallback(
    (results) => updateState({ geographies: results }),
    [updateState]
  );
  const handleCommoditiesChange = useCallback(
    (results) => updateState({ commodities: results }),
    [updateState]
  );

  // Utility creators for options (for react-select)
  const createGeogOptions = useCallback(
    (option) => ({ label: option.geography_name, value: option.id }),
    []
  );
  const createCommOptions = useCallback(
    (option) => ({ label: option.commmodity_name, value: option.id }),
    []
  );

  // Dialog close
  const closeDialog = useCallback(() => updateState({ dialogOpen: false }), [updateState]);

  // Unpack many state values for render
  const {
    newUser,
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
    dialogOpen,
    dialogTitle,
    dialogMessage,
    secret,
    secret_url,
    showModalLoader,
    updating,
    selectedDropdownUserStatusOption,
    selectedDropdownAccessLevelOption,
    selectedDropdownTitleOption,
    dropdownTitleOptions: dropdownTitleOptionsState,
    dropdownAccessLevelOptions,
  } = state;

  const dialogContent =
    typeof dialogMessage === 'string'
      ? dialogMessage
      : Array.isArray(dialogMessage)
      ? dialogMessage.map(generateMessages)
      : dialogMessage;

  const geographyOptions = (geographiesData || []).map(createGeogOptions);
  const commodityOptions = (commoditiesData || []).map(createCommOptions);

  const defaultAction = updating
    ? []
    : [<Button key="ok" variant="primary" label="OK" keyboardFocused onClick={closeDialog} />];

  return (
    <div id="Profile__UserProfile" className="user-profile-page">
      <ModalLoader open={showModalLoader} />

      <Dialog
        paperClassName="dialog-paper"
        open={dialogOpen}
        title={dialogTitle}
        actions={defaultAction}
        onRequestClose={closeDialog}
      >
        {dialogContent}
      </Dialog>

      <div className={`${userOnly ? 'hidden' : ''}`}>
        <LinkButton
          className="profile-page__back-button back-button"
          onClick={navigateBack}
          icon={<IconArrowLeft height="10px" />}
          label={profilePage.profileManager.backButton}
        />
      </div>

      <h1 className="profile-page__title">{profilePage.profileManager.userProfileTitle}</h1>

      <Divider sx={{ mb: '20px', mt: '20px' }} />

      <h2 className="profile-page__subheader">{profilePage.profileManager.userContactInfoTitle}</h2>
      <p className={`${newUser ? '' : 'hidden'}`}>{profilePage.profileManager.userProfilePrompt}</p>

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
            onChange={(evt) => updateState({ first_name: evt.target.value })}
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
            onChange={(evt) => updateState({ last_name: evt.target.value })}
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
            onChange={(evt) => updateState({ email: evt.target.value.toString().toLowerCase() })}
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
            value={
              (selectedDropdownUserStatusOption && selectedDropdownUserStatusOption.name) ||
              selectedDropdownUserStatusOption ||
              USER_STATUS_LABELS[USER_STATUS.Active]
            }
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
            onChange={(evt) => updateState({ phone: evt.target.value })}
          />
        </div>
      </section>

      <Divider sx={{ mb: '20px', mt: '20px' }} />

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
                  options={dropdownAccessLevelOptions || []}
                  onChange={(evt) => handleDropdownAccessLevelSelection(evt)}
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
                    (selectedDropdownAccessLevelOption &&
                      selectedDropdownAccessLevelOption.label) ||
                    selectedDropdownAccessLevelOption ||
                    ''
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
              options={dropdownTitleOptionsState}
              onChange={(evt) => handleDropdownTitleSelection(evt)}
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
              onChange={(evt) => updateState({ other_title: evt.target.value })}
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
              onChange={handleGeographiesChange}
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
              onChange={handleCommoditiesChange}
              isMulti
              isSearchable
              placeholder={profilePage.profileManager.multiselectPrompt}
              value={commodities}
            />
          </div>
        </section>
      </section>

      <Divider sx={{ mb: '20px', mt: '20px' }} />

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
            onChange={updateAuthenticationPreference}
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
            onChange={updateAuthenticationPreference}
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
              <img width="196" height="196" src={secret_url} alt="Google Auth QR" />
            </div>
          </div>
          <div className="col">
            <div className="flex-grid-column">
              <label htmlFor="user_secret" className="block-label">
                {profilePage.profileManager.googleSecretPrompt}
              </label>
              <input id="user_secret" value={secret} name="user_secret" readOnly />
            </div>
          </div>
        </div>
      </section>

      <Divider sx={{ mb: '20px', mt: '20px' }} />

      <div className="profile-button-container justify-end">
        <Button
          variant="primary"
          onClick={saveUser}
          style={{ marginRight: '10px' }}
          label={profilePage.profileManager.save}
        />

        {userOnly ? null : (
          <Button
            onClick={navigateBack}
            style={{ marginRight: '10px' }}
            label={profilePage.profileManager.cancel}
          />
        )}

        {userOnly || newUser ? null : (
          <Button
            variant="primary"
            className={`${status_id === USER_STATUS.Active ? 'button-disabled' : ''}`}
            disabled={status_id === USER_STATUS.Active}
            onClick={activateUser}
            style={{ marginRight: '10px' }}
            label={profilePage.profileManager.activate}
          />
        )}

        {(userOnly || userInfo.email === email) && !newUser ? (
          <Button
            onClick={() => (window.location.href = '/changeExist')}
            style={{ marginRight: '10px' }}
            label={profilePage.profileManager.changePassword}
          />
        ) : null}

        {userOnly ||
        newUser ||
        !(status_id === 2) ||
        (userInfo.email === email && !newUser) ? null : (
          <Button
            onClick={adminResetPassword}
            style={{ marginRight: '10px' }}
            label={profilePage.profileManager.resetPassword}
          />
        )}

        {userOnly || newUser ? null : (
          <Button
            variant="danger"
            className={`${status_id === USER_STATUS.Inactive ? 'button-disabled' : ''}`}
            disabled={status_id === USER_STATUS.Inactive}
            onClick={deactivateUser}
            style={{ marginRight: '10px' }}
            label={profilePage.profileManager.deactivate}
          />
        )}
      </div>
    </div>
  );
}
