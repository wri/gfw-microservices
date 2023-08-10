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
  accountUsage: {
    id: 'account-usage',
    icon: 'running_with_errors',
    title: 'Usage',
    userAccessLevel: [ADMIN],
  },
};
