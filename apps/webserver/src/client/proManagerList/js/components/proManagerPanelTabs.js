import { userAccessLevel } from '../../../common/js/config';

const { ADMIN, EDITOR, VIEWER } = userAccessLevel;

/**
 * Icons IDs
 * @see {@link https://fonts.google.com/icons}
 */

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
  accountUsage: {
    id: 'account-usage',
    icon: 'query_stats',
    title: 'Account Usage',
    userAccessLevel: [ADMIN, EDITOR, VIEWER],
  },
  accounLimits: {
    id: 'account-limits',
    icon: 'running_with_errors',
    title: 'Account Limits',
    userAccessLevel: [ADMIN, EDITOR, VIEWER],
  },
  latestCommits: {
    id: 'latest-commits',
    icon: 'commit',
    title: 'Latest Commits',
    userAccessLevel: [ADMIN, EDITOR, VIEWER],
  },
  featureFlags: {
    id: 'feature-flags',
    icon: 'settings_input_component',
    title: 'Features',
    userAccessLevel: [ADMIN, EDITOR, VIEWER],
  },
};
