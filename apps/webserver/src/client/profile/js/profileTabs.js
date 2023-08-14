import { userAccessLevel, subscriptionStatusOptions } from '../../common/js/config';

const { ADMIN, EDITOR, VIEWER } = userAccessLevel;

const { PREMIUM_SUBSCRIPTION, STANDARD_SUBSCRIPTION } = subscriptionStatusOptions.reduce(
  (acc, curr) => {
    const lowercaseLabel = curr.label.toLowerCase();

    if (lowercaseLabel === 'premium') {
      acc.PREMIUM_SUBSCRIPTION = curr.value;
    }
    if (lowercaseLabel === 'standard') {
      acc.STANDARD_SUBSCRIPTION = curr.value;
    }

    return acc;
  },
  {}
);

const profileTabs = {
  myOrganization: {
    id: 'MY_ORGANIZATION',
    icon: 'corporate_fare',
    title: 'My Organization',
    userAccessLevel: [ADMIN, EDITOR, VIEWER],
    suscriptionStatus: [STANDARD_SUBSCRIPTION],
  },
  userManagement: {
    id: 'USER_MANAGEMENT',
    icon: 'people',
    title: 'User Management',
    userAccessLevel: [ADMIN],
    suscriptionStatus: [STANDARD_SUBSCRIPTION],
  },
  accountUsage: {
    id: 'account-usage',
    icon: 'running_with_errors',
    title: 'Usage',
    userAccessLevel: [ADMIN],
    /* As a PREMIUM account admin I want to see my account usage */
    suscriptionStatus: [PREMIUM_SUBSCRIPTION],
  },
};

export default profileTabs;
