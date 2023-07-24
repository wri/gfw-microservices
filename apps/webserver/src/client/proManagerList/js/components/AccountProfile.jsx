import React from 'react';
import GfwButton from '../../../common/js/components/GfwButton';
import '../../css/AccountProfile.scss';
import DialogProvider from './Dialog';
import {
  AccountProfileForm,
  AccountStatusSetting
} from './AccountProfileForms';
import UserProfileManager from './UserProfileManager';

export default function AccountProfile({
  users,
  currentAccount,
  classificationsData,
  statusData,
  accessData,
  disable:isNotPending, /* organization_status_id !== 1 */
  policyList,
}) {
  const back = () => {
    window.location.href = '/pro-manager-list?tab=accounts';
  };

  return (
    <DialogProvider>
      <AccountProfileHeader>
        <div /* purposefully */ />
        <GfwButton classNames="btn-green" onClick={back} value="Back to Profile Manager" />
      </AccountProfileHeader>
      <SettingSection heading="Account Profile">
        <AccountProfileForm 
          isNotPending={isNotPending}
          accountData={currentAccount}
          classificationsData={classificationsData}
          policyList={policyList}
        />
      </SettingSection>
      <SettingSection 
        heading="Account Status">
        <AccountStatusSetting 
          organization_id={currentAccount.organization_id}
          organization_status_id={currentAccount.organization_status_id}
        />
      </SettingSection>
        <SettingSection
          heading="Users">
          <div className="users-table-design-control">
            <UserProfileManager
              users={users.filter((user) => (
                user.organization_id === currentAccount.organization_id
              ))}
              statusData={statusData}
              accessData={accessData}
            />
          </div>
        </SettingSection>
    </DialogProvider>
  );
}


/**
 * Header Control
 * @param {ReactNode} children
 * @returns {ReactElement}
 */
function AccountProfileHeader({ children }) {
  return (
    <div className='account-page-header'>
      {children}
    </div>
  );
}

/**
 * Setting Section Control
 * @param {string} heading
 * @param {string} subHeading
 * @param {ReactNode} children
 * @returns {ReactElement}
 */
function SettingSection({ heading, subHeading, children }) {
  return (
    <div className="profile-setting-section">
      <div className={`left-column ${
        !heading && !subHeading 
          ? 'hidden' 
          : ''}`}>
        {heading && <h2>{heading}</h2>}
        {subHeading && <p>{subHeading}</p>}
      </div>
      <div className="right-column">{children}</div>
    </div>
  );
}


