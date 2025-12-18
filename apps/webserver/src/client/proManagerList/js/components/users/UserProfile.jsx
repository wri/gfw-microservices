import { useState, useMemo, useRef } from 'react';
import { Dialog } from '@mui/material';
import Select from 'react-select';

import { PillButton } from '../../../../components';
import { profilePage } from '../../../../common/js/config';
import { fieldValidations } from '../../../../profile/js/utils/validations';
import '../../../css/profile.scss';
import { PRO_MANAGER_PATH } from '../../common/paths';

// Constants
const TITLE_OTHER_ID = 10;
const STATUS_ACTIVE_ID = 2;
const STATUS_INACTIVE_ID = 3;
const DEFAULT_ACCESS_LEVEL = 3;
const DEFAULT_STATUS_ID = 1;
const DEFAULT_TITLE_ID = 1;

export default function UserProfile({
  currentUser,
  geographiesData,
  commoditiesData,
  titlesData,
  disable,
  userOnly,
}) {
  // Initialize geographies and commodities arrays
  const initialGeographies = useMemo(() => {
    return currentUser.user_geography_ids.split(',').map((geo) => {
      const geogId = parseInt(geo);
      const data = geographiesData.find((d) => d.id == geogId);
      return data ? { label: data.geography_name, value: geogId } : { label: '', value: geogId };
    });
  }, [currentUser.user_geography_ids, geographiesData]);

  const initialCommodities = useMemo(() => {
    return currentUser.user_commodity_ids.split(',').map((commodity) => {
      const commId = parseInt(commodity);
      const data = commoditiesData.find((d) => d.id == commId);
      return data ? { label: data.commmodity_name, value: commId } : { label: '', value: commId };
    });
  }, [currentUser.user_commodity_ids, commoditiesData]);

  // State hooks
  const userId = currentUser.user_id || '';
  const [firstName, setFirstName] = useState(currentUser.first_name || '');
  const middleInitial = currentUser.middle_initial || '';
  const [lastName, setLastName] = useState(currentUser.last_name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const orgName = currentUser.organization_name || '';
  const [accessLevelId, setAccessLevelId] = useState(
    currentUser.access_level_id || DEFAULT_ACCESS_LEVEL
  );
  const [statusId, setStatusId] = useState(currentUser.user_status_id || DEFAULT_STATUS_ID);
  const [title, setTitle] = useState(currentUser.title_id || DEFAULT_TITLE_ID);
  const [otherTitle, setOtherTitle] = useState(currentUser.other_title || '');
  const [geographies, setGeographies] = useState(initialGeographies);
  const [commodities, setCommodities] = useState(initialCommodities);
  const [viirsAlerts, setViirsAlerts] = useState(currentUser.viirs_email_frequency || 0);
  const [gladAlerts, setGladAlerts] = useState(currentUser.glad_email_frequency || 0);
  const [granChacoAlerts, setGranChacoAlerts] = useState(
    currentUser.gran_chaco_email_frequency || 0
  );
  const [enableAlerts, setEnableAlerts] = useState(currentUser.email_subscription || false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [updating, setUpdating] = useState(false);

  // Refs

  const handleInputChange = (setter) => (evt) => {
    setter(evt.target.value);
  };

  const statusChange = (evt) => {
    setStatusId(evt.target.value);
  };

  const accessChange = (evt) => {
    setAccessLevelId(evt.target.value);
  };

  const titleChange = (evt) => {
    setTitle(parseInt(evt.target.value));
  };

  const updateOther = (evt) => {
    setOtherTitle(evt.target.value);
  };

  const geogChange = (results) => {
    setGeographies(results);
  };

  const commChange = (results) => {
    setCommodities(results);
  };

  const updateEmailPrefs = () => {
    setEnableAlerts(!enableAlerts);
  };

  const activateUser = () => {
    fetch('/profile/activateUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userId,
        email: email,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.redirect) {
          window.location = res.redirect;
        }
      })
      .catch((error) => {
        console.error('Error activating user:', error);
      });
  };

  const deactivateUser = () => {
    fetch('/profile/deactivateUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userId,
        email: email,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.redirect) {
          window.location = res.redirect;
        }
      })
      .catch((error) => {
        console.error('Error deactivating user:', error);
      });
  };

  const createSelectOption = (labelKey) => (option, i) =>
    (
      <option value={option.id} id={option.id} key={i} className="classifications-option">
        {option[labelKey]}
      </option>
    );

  const createMultiSelectOption = (labelKey) => (option) => ({
    label: option[labelKey],
    value: option.id,
  });

  const validateField = (fieldName, value, errors, missing) => {
    const field = fieldValidations[fieldName];

    field.validations.forEach((validation) => {
      if (validation(value) === false) {
        errors.push(field.text);
      }
    });

    field.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(value.trim()) === false) {
        missing.push(field.text);
      }
    });
  };

  const showErrorDialog = (errors, missing) => {
    if (errors.length > 0 && missing.length > 0) {
      errors.unshift('Please review for invalid characters:');
      missing.unshift('Please enter:');
      const errorsAndMissing = [...errors, ...missing];
      setDialogOpen(true);
      setDialogTitle('Invalid field entries & Mandatory fields missing');
      setDialogMessage(errorsAndMissing);
    } else if (errors.length > 0) {
      errors.unshift('Please review for invalid characters:');
      setDialogOpen(true);
      setDialogTitle('Invalid field entries');
      setDialogMessage(errors);
    } else {
      missing.unshift('Please enter:');
      setDialogOpen(true);
      setDialogTitle('Mandatory fields missing');
      setDialogMessage(missing);
    }
    setUpdating(false);
  };

  const updateUser = () => {
    const errors = [];
    const missing = [];

    validateField('first_name', firstName, errors, missing);
    validateField('last_name', lastName, errors, missing);
    validateField('email', email, errors, missing);
    validateField('phone', phone, errors, missing);

    if (errors.length === 0 && missing.length === 0) {
      const route = '/pro-manager/updateProAccountUser';
      setDialogOpen(true);
      setDialogTitle('Updating...');
      setDialogMessage('');
      setUpdating(true);

      const geoString = geographies.map((g) => g.value).join(', ');
      const commoditiesString = commodities.map((c) => c.value).join(', ');

      fetch(route, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          first_name: firstName,
          middle_initial: middleInitial,
          last_name: lastName,
          email: email,
          phone: phone,
          title: title,
          other_title: otherTitle,
          geographies: geoString,
          commodities: commoditiesString,
        }),
      })
        .then((response) => response.json())
        .then((res) => {
          setDialogOpen(false);
          setDialogTitle('');
          setDialogMessage('');
          setUpdating(false);
          if (res.redirect) {
            window.location = res.redirect;
          }
        })
        .catch((error) => {
          console.error('Error updating user:', error);
          setDialogOpen(true);
          setDialogTitle('Error');
          setDialogMessage('Failed to update user. Please try again.');
          setUpdating(false);
        });
    } else {
      showErrorDialog(errors, missing);
    }
  };

  const shouldCloseDialog = () => {
    setDialogOpen(false);
  };

  const generateMessages = (message, i) => {
    return <p key={message + i}>{message}</p>;
  };

  const createViirsOption = (option, j) => (
    <td key={j}>
      <input
        type="radio"
        id={option.id + 'viirs'}
        value={option.id}
        key={j + 'viirs'}
        checked={viirsAlerts === option.id}
        onChange={(evt) => setViirsAlerts(parseInt(evt.target.value))}
      />
      <label htmlFor={option.id + 'viirs'} className="profile-label">
        {option.name}
      </label>
    </td>
  );

  const createGladOption = (option, j) => (
    <td key={j}>
      <input
        type="radio"
        id={option.id + 'glad'}
        value={option.id}
        key={j + 'glad'}
        checked={gladAlerts === option.id}
        onChange={(evt) => setGladAlerts(parseInt(evt.target.value))}
      />
      <label htmlFor={option.id + 'glad'} className="profile-label">
        {option.name}
      </label>
    </td>
  );

  const createGranChacoOption = (option, j) => (
    <td key={j}>
      <input
        type="radio"
        id={option.id + 'granChaco'}
        value={option.id}
        key={j + 'granChaco'}
        checked={granChacoAlerts === option.id}
        onChange={(evt) => setGranChacoAlerts(parseInt(evt.target.value))}
      />
      <label htmlFor={option.id + 'granChaco'} className="profile-label">
        {option.name}
      </label>
    </td>
  );

  // Render logic
  const dialogContent =
    typeof dialogMessage === 'string' ? dialogMessage : dialogMessage.map(generateMessages);
  let action = shouldCloseDialog;

  if (dialogTitle === 'Account Successfully Requested') {
    action = shouldCloseDialog; // Note: shouldRedirect was not defined in original
  }
  const defaultAction = updating
    ? []
    : [
        <PillButton key="ok-button" variant="contained" size="small" autoFocus onClick={action}>
          Ok
        </PillButton>,
      ];

  const statusOptions = profilePage.userProfile.statusOptions.map(createSelectOption('name'));
  const accessOptions = profilePage.userProfile.accessOptions.map(createSelectOption('name'));

  const viirsOptions = profilePage.userProfile.viirsEmailFrequencies.map(createViirsOption);
  const gladOptions = profilePage.userProfile.gladEmailFrequencies.map(createGladOption);
  const granChacoOptions =
    profilePage.userProfile.granChacoEmailFrequencies.map(createGranChacoOption);
  const commOptions = commoditiesData.map(createMultiSelectOption('commmodity_name'));
  const geogOptions = geographiesData.map(createMultiSelectOption('geography_name'));
  const titleOptions = titlesData.map(createSelectOption('title'));

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
        <PillButton variant="contained" size="small" href={`${PRO_MANAGER_PATH}?tab=users`}>
          Back to profile manager
        </PillButton>
      </div>

      <section className="section-container">
        <div className="flex-grid-thirds">
          <div className="col">
            <div className="flex-grid-column">
              <div className="col flex-grid-column">
                <span className="profile-label">First Name</span>
                <input
                  value={firstName}
                  disabled={disable}
                  required
                  id="user_first_name"
                  name="user_first_name"
                  onChange={handleInputChange(setFirstName)}
                />
              </div>
            </div>
            <div className="flex-grid-column">
              <div className="col flex-grid-column">
                <span className="profile-label">Last Name</span>
                <input
                  value={lastName}
                  disabled={disable}
                  required
                  id="user_last_name"
                  name="user_last_name"
                  onChange={handleInputChange(setLastName)}
                />
              </div>
            </div>
            <div className="flex-grid-column">
              <div className="col flex-grid-column">
                <span className="profile-label">E-mail</span>
                <input
                  value={email}
                  disabled={disable}
                  required
                  name="user_email"
                  onChange={handleInputChange(setEmail)}
                />
              </div>
            </div>
          </div>
          <div className="col">
            <div className="flex-grid-column">
              <div className="col flex-grid-column">
                <label className="profile-label">Current User Status</label>
                <select
                  value={statusId}
                  disabled={true}
                  required
                  name="user_status"
                  onChange={statusChange}
                  ref={statusSelectRef}
                >
                  {statusOptions}
                </select>
              </div>
            </div>
            <div className="flex-grid-column">
              <div className="col flex-grid-column">
                <span className="profile-label">Organization</span>
                <input value={orgName} disabled={true} name="user_organization" />
              </div>
            </div>
            <div className="flex-grid-column">
              <div className="col flex-grid-column">
                <span className="profile-label">Phone</span>
                <input
                  value={phone}
                  disabled={disable}
                  required
                  name="user_phone"
                  onChange={handleInputChange(setPhone)}
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
                    value={accessLevelId}
                    disabled={disable}
                    required
                    name="access_status"
                    onChange={accessChange}
                    ref={accessSelectRef}
                  >
                    {accessOptions}
                  </select>
                </div>
              </div>
              <div className="flex-grid-column">
                <div className="col flex-grid-column">
                  <span className="profile-label">Title</span>
                  <select
                    value={title}
                    disabled={disable}
                    required
                    name="user_title_id"
                    ref={titleSelectRef}
                    onChange={titleChange}
                  >
                    {titleOptions}
                  </select>
                </div>
                <div className={`account-info-item ${title === TITLE_OTHER_ID ? '' : 'hidden'}`}>
                  <span className="account-info-label">Alternative Title</span>
                  <input
                    required
                    name="alternative_title"
                    value={otherTitle}
                    onChange={updateOther}
                    className="account-info-input"
                  />
                </div>
              </div>

              <div
                className={`flex-grid-column ${
                  title === TITLE_OTHER_ID || title === String(TITLE_OTHER_ID) ? '' : 'hidden'
                }`}
              >
                <div className="col flex-grid-column">
                  <span className="profile-label">Alternative Title</span>
                  <input
                    required
                    name="alternative_title"
                    value={otherTitle}
                    onChange={updateOther}
                    disabled={disable}
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
                    onChange={geogChange}
                    value={geographies}
                    disabled={disable}
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
                    onChange={commChange}
                    value={commodities}
                    disabled={disable}
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
            checked={enableAlerts}
            disabled={disable}
            type="checkbox"
            name="email_preferences"
            onChange={updateEmailPrefs}
          />
          <label
            htmlFor="EnableEmailAlertNotificationsManager"
            className={`profile-label ${disable ? 'disabled' : null}`}
          >
            Enable Email Alert Notifications
          </label>
          <div className={`space-element ${enableAlerts ? '' : 'hidden'}`}>
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
                  <td>Gran Chaco Deforestation Alerts</td>
                  {granChacoOptions}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <div className="profile-button-container justify-end">
        {userOnly ? null : (
          <PillButton variant="contained" size="small" href={`${PRO_MANAGER_PATH}?tab=users`}>
            Cancel
          </PillButton>
        )}
        {userOnly ? null : (
          <PillButton
            variant="contained"
            size="small"
            disabled={statusId === STATUS_ACTIVE_ID}
            onClick={activateUser}
          >
            Activate
          </PillButton>
        )}

        {userOnly ? null : (
          <PillButton
            variant="contained"
            size="small"
            disabled={statusId === STATUS_INACTIVE_ID}
            onClick={deactivateUser}
          >
            Deactivate
          </PillButton>
        )}
        <PillButton variant="contained" size="small" disabled={disable} onClick={updateUser}>
          Save
        </PillButton>
      </div>
    </div>
  );
}
