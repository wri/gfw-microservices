export const profilePage = {
  userProfile: {
    title: 'User Profile',
    contactInfo: 'Contact Information',
    backToManager: 'Back to Profile Manager',
    firstLabel: 'First Name *:',
    middleI: 'Middle Initial :',
    lastLabel: 'Last Name *:',
    emailLabel: 'E-mail *:',
    accountLabel: 'Account(s) *:',
    currentStatusLabel: 'Current User Status:',
    phoneLabel: 'Phone *:',

    accessLabel: 'Access Level *:',
    titleLabel: 'Title *:',
    geogLabel: 'Geographies:',
    interestsLabel: 'Interests:',
    alertTitle: 'Alerts Email Notifications Preferences',
    enableLabel: 'Enable Email Alert Notifications',

    currentLabel: 'Currently Sharing With:',
    shares: 'Shares',

    saveButton: 'Save',
    activateButton: 'Activate',
    deactivateButton: 'Deactivate',
    statusOptions: [
      {
        name: 'Draft',
        id: 0,
      },
      {
        name: 'Pending',
        id: 1,
      },
      {
        name: 'Active',
        id: 2,
      },
      {
        name: 'Inactive',
        id: 3,
      },
    ],
    accessOptions: [
      {
        name: 'Administrator',
        id: 1,
      },
      {
        name: 'Editor',
        id: 2,
      },
      {
        name: 'Viewer',
        id: 3,
      },
    ],
    viirsEmailFrequencies: [
      {
        name: 'Every Day',
        id: 4,
      },
      {
        name: 'Every Week',
        id: 3,
      },
      {
        name: 'Every Month',
        id: 2,
      },
      {
        name: 'Every Quarter',
        id: 1,
      },
      {
        name: 'Never',
        id: 0,
      },
    ],
    gladEmailFrequencies: [
      {
        name: 'Every Week',
        id: 3,
      },
      {
        name: 'Every Month',
        id: 2,
      },
      {
        name: 'Every Quarter',
        id: 1,
      },
      {
        name: 'Never',
        id: 0,
      },
    ],
    raddEmailFrequencies: [
      {
        name: 'Every Week',
        id: 3,
      },
      {
        name: 'Every Month',
        id: 2,
      },
      {
        name: 'Every Quarter',
        id: 1,
      },
      {
        name: 'Never',
        id: 0,
      },
    ],
    formaEmailFrequencies: [
      {
        name: 'Every Month',
        id: 2,
      },
      {
        name: 'Every Quarter',
        id: 1,
      },
      {
        name: 'Never',
        id: 0,
      },
    ],
    granChacoEmailFrequencies: [
      {
        name: 'Every Month',
        id: 2,
      },
      {
        name: 'Every Quarter',
        id: 1,
      },
      {
        name: 'Never',
        id: 0,
      },
    ],
  },
  profileManager: {
    title: 'Profile manager',
    userProfileTitle: 'User Profile',
    accountProfiles: 'Account Profiles',
    searchAccounts: 'search accounts...',
    createNew: 'Create New',
    viewActivityLog: 'View Activity Log',
    download: 'Download',
    userProfiles: 'Users',
    activityLogTitle: 'Activity log',
    searchUsers: 'Search users',
    searchLogs: 'search logs...',
    deactivateAll: 'Deactivate All',
    userAccountFields: [
      // 'Organization ID',
      'User Name',
      'E-mail',
      'Phone',
      'Title',
      // 'Organization Classifications',
      // 'Sharing',
      'Access Level',
      'User Status', // ,
      // 'email_subscription'
    ],
    organizationTitle: 'Organization',
    multiselectPrompt: 'Select one or more.',
    selectCountry: 'Select Country',
    policyPrompt: 'Upload policy document to reference within the system (.doc, .pdf)',
    policyUpload: 'Upload',
    policyDelete: 'Delete Documents',
    policyDownload: 'Download',
    accountProfileFields: [
      'Name',
      'Subsidiary',
      'Address',
      'Website',
      'Parent organization',
      'Policy',
      'Account classifications',
      'Current account status',
    ],
    backButton: 'Back to Profile Manager',
    userContactInfoTitle: 'Contact information',
    userProfileInfoTitle: 'Profile information',
    userProfilePrompt: 'Please complete all mandatory fields * below.',
    userSecondLevelTitle: 'Second Level Authentication Preferences',
    userSecondLevelPrompt: 'Select your preferred method for account verification.',
    userContactFields: ['First name', 'Last name', 'E-mail', 'Current user status', 'Phone'],
    userProfileFields: [
      'Access Level',
      'Title',
      'E-mail',
      'Current user status',
      'Phone',
      'Geographies of interest',
      'Commodities of Interest',
    ],
    googleVerifyPrompt: 'Open your Google Authenticator App and scan the image!',
    googleSecretPrompt: 'Camera not working? Copy & paste the secret!',
    secondLevelFields: ['E-mail', 'Google Authenticator'],
    save: 'Save',
    cancel: 'Cancel',
    activate: 'Activate',
    changePassword: 'Change password',
    resetPassword: 'Reset password',
    deactivate: 'Deactivate',
    activityLogHeaders: [
      'Username',
      'Category',
      'Activity name',
      'Activity description',
      'Timestamp',
    ],
  },
  accountUsage: {
    title:
      'Analytics usage for subscription year ({subscriptionYearStart} to {subscriptionYearEnd})',
    locationsAnalyzed: 'Locations Analyzed',
    tokens: 'Tokens',
    areaAnalyzed: 'Hectares Analyzed',
  },
};
