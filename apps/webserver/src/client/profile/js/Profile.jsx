import React, { useState } from 'react';
import MyProfile from './components/MyProfile';
import UserProfileManager from './components/sub/UserProfileManager';
import ProfileSideBar from './ProfileSideBar';
import { profileTabs } from './profileTabs';
import './Profile.scss';

function Profile({
  organization,
  userInfo,
  users,
  classificationsData,
  commoditiesData,
  geographiesData,
  titlesData,
  policyList,
}) {
  const [selectedTab, setSelectedTab] = useState(profileTabs.myOrganization.id);
  return (
    <div className="profile">
      <div className="profile__container">
        <ProfileSideBar
          tabOptions={profileTabs}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          userAccessLevel={userInfo.access_level_id}
        />
        <div className="profile__content">
          {selectedTab === profileTabs.myOrganization.id && (
            <MyProfile
              organization={organization}
              userInfo={userInfo}
              users={users}
              classificationsData={classificationsData}
              commoditiesData={commoditiesData}
              geographiesData={geographiesData}
              titlesData={titlesData}
              policyList={policyList}
            />
          )}
          {selectedTab === profileTabs.userManagement.id && <UserProfileManager users={users} />}
        </div>
      </div>
    </div>
  );
}

export default Profile;
