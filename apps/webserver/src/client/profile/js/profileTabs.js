import { userAccessLevel, SUBSCRIPTION_STATUSES } from '../../common/js/config';
const { ADMIN, EDITOR, VIEWER } = userAccessLevel;
const { STANDARD, PREMIUM } = SUBSCRIPTION_STATUSES;
import featureFlags from '../../../utils/general.utils';

const { isPermanentFlagForExternalApiKeysAvailable } = featureFlags;

const profileTabs = {
  myOrganization: {
    id: 'MY_ORGANIZATION',
    icon: 'corporate_fare',
    title: 'My Organization',
    userAccessLevel: [ADMIN, EDITOR, VIEWER],
    suscriptionStatus: [STANDARD],
  },
  userManagement: {
    id: 'USER_MANAGEMENT',
    icon: 'people',
    title: 'User Management',
    userAccessLevel: [ADMIN],
    suscriptionStatus: [STANDARD],
  },
  accountUsage: {
    id: 'account-usage',
    icon: 'running_with_errors',
    title: 'Usage',
    userAccessLevel: [ADMIN],
    /* As a PREMIUM account admin I want to see my account usage */
    suscriptionStatus: [PREMIUM],
  },
  ...(isPermanentFlagForExternalApiKeysAvailable
    ? {
  apiKeys: {
    id: 'api-keys',
    icon: 'api',
    title: 'Api Keys',
    userAccessLevel: [ADMIN],
    /* As a PREMIUM account admin I want to see my account usage */
    suscriptionStatus: [PREMIUM],
  }}
  : {}),
};

export default profileTabs;
