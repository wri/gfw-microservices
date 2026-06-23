import { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import qr from 'qrcode';
import { Box, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import { fieldValidations } from '../../../profile/js/utils/validations';
import {
  addUser,
  changeUser,
  updateUser,
  updateCurrentUser,
} from '../../../profile/js/actions/profileActions';

import { USER_STATUS, USER_STATUS_LABELS } from '../../../../config/env/userStatuses.constants';

import { profilePage } from '../../../common/js/config';
import {
  LANGUAGE_OPTIONS,
  getDefaultLanguageForCountry,
  normalizeCountryToken,
} from '../../../common/js/constants/userLanguage.constants';
import * as userProfileService from '../services/userProfileService.ts';
import { Link, PillButton } from '../../../components';
import GfwSelect from '../../../common/js/components/GfwSelect';
import ModalLoader from '../../../common/js/components/Loaders/ModalLoader';
import IconArrowLeft from '../../../common/js/components/icon/IconArrowLeft';

import store from '../../../profile/js/store';
import '../../css/userProfile.scss';
import forgotStrings from '../../../forgot/js/components/forgotStrings';
import {
  parseMultiIds,
  buildSelectedMulti,
  dropdownTitleOptions,
  buildAccessLevelOptions,
  dropdownUserStatusOptions,
  getUserTitle,
  getUserAccessLevel,
  getUserStatus,
  createGeogOptions,
  createCommOptions,
} from '../utils/userProfileHelpers.ts';
import {
  createErrorDialog,
  createSuccessDialog,
  createValidationDialog,
  createActivationSuccessDialog,
  createDeactivationSuccessDialog,
} from '../utils/dialogHelpers.ts';

// Constants
const ACCESS_LEVEL = {
  ADMINISTRATOR: 1,
  USER: 2,
};

const TITLE = {
  OTHER: 10, // "Other" title option that requires custom input
};

const STATUS = {
  PENDING: 1,
  ACTIVE: 2,
  INACTIVE: 3,
};

const AUTH_PREFERENCE = {
  GOOGLE_AUTH: 1,
  PASSWORD: 2,
};

const getOrgCountry = (currentAccount) => {
  const orgAddress = currentAccount?.organization_address || '';
  const addressTokens = orgAddress
    .split(',')
    .map((token) => normalizeCountryToken(token))
    .filter(Boolean);

  return addressTokens.length ? addressTokens[addressTokens.length - 1] : '';
};

const getDefaultLanguageFromOrgCountry = (currentAccount) => {
  const orgCountry = getOrgCountry(currentAccount);
  return getDefaultLanguageForCountry(orgCountry);
};

export default function UserProfile(props) {
  const {
    titlesData,
    currentUser,
    currentAccount,
    geographiesData,
    commoditiesData,
    userInfo,
    users,
    userOnly,
  } = props;

  // Helper to validate a single field
  const validateField = (fieldValue, { validations, mandatoryChecks, text }) => {
    const errors = validations.filter((v) => !v(fieldValue)).map(() => text);
    const missing = mandatoryChecks.filter((m) => !m(fieldValue)).map(() => text);
    return { errors, missing };
  };

  const statusData = profilePage.userProfile.statusOptions;
  const accessLevelData = profilePage.userProfile.accessOptions;

  // Initial derived values
  const newUserInitial = !currentUser.email;
  const defaultLanguage = getDefaultLanguageFromOrgCountry(currentAccount);
  const initialLanguage = (
    currentUser.language || (newUserInitial ? defaultLanguage : 'EN')
  ).toUpperCase();
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

  const [state, setState] = useState(() => ({
    newUser: newUserInitial,
    id: currentUser.user_id ?? currentUser.id ?? '',
    first_name: currentUser.first_name ?? '',
    middle_initial: currentUser.middle_initial ?? '',
    last_name: currentUser.last_name ?? '',
    email: currentUser.email ?? '',
    phone: currentUser.phone ?? '',
    organization_name: currentUser.organization_name ?? userInfo?.organization_name ?? '',
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
    preferred_language: initialLanguage,
    selectedDropdownLanguageOption:
      LANGUAGE_OPTIONS.find((option) => option.value === initialLanguage) || LANGUAGE_OPTIONS[0],
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
      const parsed = await userProfileService.getUserSecret(email);
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

  // If current user is not new and uses Google Auth, get QR
  useEffect(() => {
    if (
      state.email &&
      state.newUser === false &&
      state.auth_preference_id === AUTH_PREFERENCE.GOOGLE_AUTH
    ) {
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
        const parsedResponse = await userProfileService.activateUser(
          id,
          email,
          first_name,
          last_name
        );

        if (!parsedResponse) {
          updateState(createErrorDialog('Activation failed: invalid server response.'));
          return false;
        }

        const { errorCode, userMessage } = parsedResponse;

        if (errorCode) {
          updateState(createErrorDialog(userMessage));
          return false;
        } else {
          updateState({
            ...createActivationSuccessDialog(first_name, last_name),
            status_id: USER_STATUS.Active,
          });

          const userObject = {
            user_id: id,
            status_id: USER_STATUS.Active,
            activated_time: new Date(),
          };
          store.dispatch(updateUser(userObject));
          return true;
        }
      } catch (err) {
        updateState(createErrorDialog('Activation failed.'));
        return false;
      }
    },
    [state, updateState]
  );

  // Deactivation
  const deactivateUser = useCallback(() => {
    const { access_level_id, id, email, first_name, last_name } = state;
    const isAdmin = access_level_id === ACCESS_LEVEL.ADMINISTRATOR;
    const isSelf = userInfo.id === id;
    const numberOfOrgAdmins = (users || []).filter(
      (user) =>
        user.access_level_id === ACCESS_LEVEL.ADMINISTRATOR && user.status_id === STATUS.ACTIVE
    ).length;

    if (numberOfOrgAdmins <= 1 && isAdmin) {
      updateState({
        ...createErrorDialog(
          'Deactivating this user will leave the organization without an administrator.',
          'Unable to deactivate user'
        ),
        updating: false,
      });
      return;
    }
    if (isSelf && isAdmin) {
      updateState({
        ...createErrorDialog(
          'You are not allowed to deactivate yourself as an administrator.',
          'Unable to deactivate user'
        ),
        updating: false,
      });
      return;
    }

    updateState({ showModalLoader: true });
    userProfileService
      .deactivateUser(id, email)
      .then((parsedResponse) => {
        const { errorCode, userMessage } = parsedResponse;
        if (errorCode) {
          updateState(createErrorDialog(userMessage));
        } else {
          updateState({
            ...createDeactivationSuccessDialog(first_name, last_name),
            status_id: USER_STATUS.Inactive,
          });
          store.dispatch(updateUser({ user_id: id, status_id: USER_STATUS.Inactive }));
        }
      })
      .catch(() => {
        updateState(createErrorDialog('Deactivation failed.'));
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
      updateState(createValidationDialog(allErrors, allMissing));
      return;
    }

    const { newUser, id } = state;
    const body = {
      id: state.id,
      first_name: state.first_name,
      middle_initial: state.middle_initial,
      last_name: state.last_name,
      email: state.email,
      phone: state.phone,
      title_id: state.title_id,
      other_title: state.other_title,
      access_level_id: state.access_level_id,
      enableAlerts: state.enableAlerts,
      auth_preference_id: state.auth_preference_id,
      preferred_language: state.preferred_language || null,
      geographies: (state.geographies || []).map((g) => g.value),
      commodities: (state.commodities || []).map((c) => c.value),
    };
    updateState({ showModalLoader: true, updating: true });

    try {
      const response = newUser
        ? await userProfileService.createUser(body)
        : await userProfileService.updateUser(body);
      updateState({ showModalLoader: false });

      if (response.errorCode) {
        updateState({
          ...createErrorDialog(
            newUser
              ? response.userMessage
              : 'Please contact system administrator for more information.',
            newUser ? 'User not added' : 'User not updated'
          ),
          updating: false,
        });
        return;
      }

      const userId = newUser ? response.user_id : id;
      updateState({ id: userId, newUser: false, updating: true });

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
        preferred_language: state.preferred_language || null,
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
        ...createErrorDialog('Request failed.'),
        updating: false,
      });
    }
  }, [state, updateState, activateUser]);

  const adminResetPassword = useCallback(async () => {
    const { email } = state;
    updateState({ showModalLoader: true });

    try {
      const res = await userProfileService.adminResetPassword(email);

      if (res) {
        if (res.systemMessage?.code === 'LimitExceededException') {
          updateState({
            ...createErrorDialog(forgotStrings.resetLimit.message, forgotStrings.resetLimit.title),
          });
        } else if (res.message === 'Success') {
          updateState({
            ...createSuccessDialog(
              forgotStrings.resetSuccess.message,
              forgotStrings.resetSuccess.title
            ),
          });
        } else {
          updateState({
            ...createErrorDialog(forgotStrings.resetError.message, forgotStrings.resetError.title),
          });
        }
      } else {
        updateState({
          ...createErrorDialog(forgotStrings.resetError.message, forgotStrings.resetError.title),
        });
      }
    } catch {
      updateState({
        ...createErrorDialog(forgotStrings.resetError.message, forgotStrings.resetError.title),
      });
    }
  }, [state.email, updateState]);

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

  const handleDropdownLanguageSelection = useCallback(
    (evt) => {
      const selectedDropdownLanguageOption = LANGUAGE_OPTIONS.find(
        (option) => option.value === evt.value
      );
      updateState({ selectedDropdownLanguageOption, preferred_language: evt.value });
    },
    [updateState]
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

  // Dialog close
  const closeDialog = useCallback(() => updateState({ dialogOpen: false }), [updateState]);

  // Unpack many state values for render
  const {
    newUser,
    first_name,
    last_name,
    email,
    phone,
    organization_name,
    title_id,
    other_title,
    status_id,
    geographies,
    commodities,
    dialogOpen,
    dialogTitle,
    dialogMessage,
    showModalLoader,
    updating,
    selectedDropdownUserStatusOption,
    selectedDropdownAccessLevelOption,
    selectedDropdownTitleOption,
    dropdownTitleOptions: dropdownTitleOptionsState,
    dropdownAccessLevelOptions,
    selectedDropdownLanguageOption,
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
    : [
        <PillButton key="ok" variant="contained" autoFocus onClick={closeDialog}>
          OK
        </PillButton>,
      ];

  return (
    <div id="Profile__UserProfile" className="user-profile-page">
      <ModalLoader open={showModalLoader} />

      <Dialog PaperProps={{ className: 'dialog-paper' }} open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>{dialogContent}</DialogContent>
        <DialogActions>{defaultAction}</DialogActions>
      </Dialog>

      <div className={`${userOnly ? 'hidden' : ''}`}>
        <IconArrowLeft height="10px" />
        <Link href="/profile" sx={{ ml: 1 }}>
          {profilePage.profileManager.backButton}
        </Link>
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
          <label htmlFor="user_organization" className="block-label">
            Organization
          </label>
          <input
            value={organization_name}
            disabled={true}
            id="user_organization"
            name="user_organization"
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
            {userInfo.access_level_id === ACCESS_LEVEL.ADMINISTRATOR ? (
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

          <div className="input-field__block-container">
            <label htmlFor="language-select" className="block-label">
              Preferred Language
            </label>
            <GfwSelect
              value={selectedDropdownLanguageOption}
              options={LANGUAGE_OPTIONS}
              onChange={(evt) => handleDropdownLanguageSelection(evt)}
              id="language-select"
            />
          </div>

          <div className={`${title_id === TITLE.OTHER ? 'col flex-grid-column' : 'hidden'}`}>
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

      <Box sx={{ display: 'flex' }}>
        <PillButton variant="contained" onClick={saveUser} style={{ marginRight: '10px' }}>
          {profilePage.profileManager.save}
        </PillButton>

        {userOnly ? null : (
          <PillButton
            variant="contained"
            color="info"
            href="/profile"
            style={{ marginRight: '10px' }}
          >
            {profilePage.profileManager.cancel}
          </PillButton>
        )}

        {userOnly || newUser ? null : (
          <PillButton
            variant="contained"
            className={`${status_id === USER_STATUS.Active ? 'button-disabled' : ''}`}
            disabled={status_id === USER_STATUS.Active}
            onClick={() => activateUser()}
            style={{ marginRight: '10px' }}
          >
            {profilePage.profileManager.activate}
          </PillButton>
        )}

        {(userOnly || userInfo.email === email) && !newUser ? (
          <PillButton
            variant="contained"
            onClick={() => (window.location.href = '/changeExist')}
            style={{ marginRight: '10px' }}
          >
            {profilePage.profileManager.changePassword}
          </PillButton>
        ) : null}

        {userOnly ||
        newUser ||
        !(status_id === STATUS.ACTIVE) ||
        (userInfo.email === email && !newUser) ? null : (
          <PillButton
            variant="contained"
            onClick={adminResetPassword}
            style={{ marginRight: '10px' }}
          >
            {profilePage.profileManager.resetPassword}
          </PillButton>
        )}

        {userOnly || newUser || status_id === USER_STATUS.Inactive ? null : (
          <PillButton variant="contained" onClick={deactivateUser} style={{ marginRight: '10px' }}>
            {profilePage.profileManager.deactivate}
          </PillButton>
        )}
      </Box>
    </div>
  );
}
