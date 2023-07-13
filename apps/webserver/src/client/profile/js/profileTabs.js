import { userAccessLevel } from '../../common/js/config';

const { ADMIN, EDITOR, VIEWER } = userAccessLevel;

export const profileTabs = {
  myOrganization: {
    id: 'MY_ORGANIZATION',
    icon: 'corporate_fare',
    title: 'My Organization',
    userAccessLevel: [ADMIN, EDITOR, VIEWER],
  },
  userManagement: {
    id: 'USER_MANAGEMENT',
    icon: 'people',
    title: 'User Management',
    userAccessLevel: [ADMIN],
  },
};

export const proManagerListTabs = {
  accountProfiles: {
    id: 'accounts',
    icon: 'corporate_fare',
    title: 'Acount Profiles',
    userAccessLevel: [ADMIN, EDITOR, VIEWER],
  },
  userProfiles: {
    id: 'users',
    icon: 'people',
    title: 'User Profiles',
    userAccessLevel: [ADMIN, EDITOR, VIEWER],
  },
};
