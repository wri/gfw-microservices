import { userAccessLevel } from '../../../common/js/config';

const { ADMIN, EDITOR, VIEWER } = userAccessLevel;

export const proManagerPanelTabs = {
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
