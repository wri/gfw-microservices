export const userAccessLevel = {
  ADMIN: 1,
  EDITOR: 2,
  VIEWER: 3,
};

export const SAVED_LOCATIONS = ['All Locations', 'Investments', 'Commodities'];

export const draftTooltipMessages = {
  owner:
    'This list contains unanalyzed locations. Please click the submit button to run analysis. Once submitted, your list will not be accessible until analysis is complete.',
  nonOwner:
    'This list contains unanalyzed locations. The list owner will need to submit the list for analysis. Once submitted, this list will not be accessible until analysis is complete.',
};

export const SUBSCRIPTION_STATUSES = {
  STANDARD: 1,
  PREMIUM: 2,
};

export const subscriptionStatusOptions = [
  { label: 'Standard', value: SUBSCRIPTION_STATUSES.STANDARD },
  { label: 'Premium', value: SUBSCRIPTION_STATUSES.PREMIUM },
];

export const accountProfileStrings = {
  sectionTitles: {
    profileForm: 'Account Profile',
    statusSetting: 'Account Status',
    limitsSetting: 'Account Limits',
    accountUsers: 'Users',
    accountUsage: 'Account Usage',
    accountProfiles: 'Account Profiles',
  },
  accountUsageLabels: {
    organizationName: 'Organization Name',
    numberOfLists: 'Number of lists',
    maxAreaPerList: 'Max area per list',
    totalAreaAnalyzed: 'Total area analyzed',
    locationsAnalyzed: 'Locations analyzed',
    tokens: 'Tokens',
    hectaresAnalyzed: 'Hectares analyzed (HA)',
    listsAnalyzed: 'Lists analyzed',
    tokensUsed: 'Tokens used',
    analysisType: 'Analysis type',
    totalLabel: 'Total',
  },
  accountFormLabels: {
    org_name: 'Organization Name',
    org_address: 'Organization Address',
    org_website: 'Organization Website',
    parent_org_name: 'Parent Organization',
    is_subsidiary: 'Is Subsidiary?',
    arr_org_classification: 'Account Classifications',
    arr_org_policy: 'Organization Policy',
    subscription_status_id: 'Subscription Status',
  },
  accountLimitsSetting: {
    locationsPerYear: 'Locations Per Year',
    tokensPerYear: 'Tokens Per Year',
    areaPerYear: 'Area Per Year',
    subHeadingSubscriptionLimits: ' Subscription',
    subHeadingCustomLimits: 'Extended Limits',
    subHeadingToAddExtraLimits: 'Add Limits',
  },
  dateRangeSelector: {
    selectStartDate: 'Select start date:',
    selectEndDate: 'Select end date:',
  },
};

export const accountLimitsStrings = {
  pageHeading: 'Account Limits',
  stantardSubscriptionSection: 'Standard Subscription',
  premiumSubscriptionSection: 'Premium Subscription',
  locationsPerYear: 'Locations Per Year',
  tokensPerYear: 'Tokens Per Year',
  areaPerYear: 'Area Per Year',
};

export const featureFlagsStrings = {
  pageHeading: 'Features',
  addCompanyDialogTitle: 'Select Organization',
};
