module.exports = {
  app: {
    author: 'World Resource Institute',
    title: 'Global Forest Watch Pro',
    keywords: 'Express, React, Redux, Node, Docker',
    description: 'Global Forest Watch Pro Application',
  },
  // DB Connection
  SQLConnection: {
    host: process.env.MSSQL_HOSTNAME,
    port: process.env.MSSQL_PORT,
    database: process.env.MSSQL_DATABASE,
    logDatabase: process.env.MSSQL_LOG_DATABASE,
    username: process.env.MSSQL_USERNAME,
    password: process.env.MSSQL_PASSWORD,
  },
  sessionVars: {
    secret: 'TheSecretSession',
  },
  AWSVars: {
    credentials: {
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    },
    cognito: {
      userpoolId: process.env.COGNITO_USERPOOLID,
      clientId: process.env.COGNITO_CLIENTID,
      region: process.env.COGNITO_REGION,
    },
    ses: {
      sender: process.env.SES_SENDER_EMAIL,
    },
    policyParams: {
      bucket: process.env.BUCKET,
      key: `${process.env.NODE_ENV}/policies/active`,
      keyPending: `${process.env.NODE_ENV}/policies/pending`,
    },
    sns: {
      topicARN: process.env.SNS_TOPIC,
    },
    sqs: {
      location_queue_url: process.env.LOCATION_QUEUE_URL,
      list_queue_url: process.env.LIST_QUEUE_URL,
    },
    s3: {
      analysisBucket: process.env.ANALYSIS_BUCKET,
    },
  },
  platformVars: {
    accessLevel: {
      Administrator: 1,
      Editor: 2,
      Viewer: 3,
    },
    // Status returned as part of Cognito Authentication Process.
    authenticationStatus: {
      // Authenticated.
      Authenticated: 1,
      // Unauthenticated or invalid username/password.
      Unauthenticated: 2,
      // First time user sign in, has default password.
      RequireNewPassword: 3,
      // In case a user forgot password and requested a reset. Has verification code.
      ConfirmPassword: 4,
      // User is disabled, not just unauthenticated. For inactive users.
      Disabled: 5,
      // When an admin resets a users password
      ResetRequired: 6,
      // When a user has tried to login too many times
      ForceReset: 7,
      // When a user's account has been deactivated due to inactivity after account creation
      ResendPassword: 8,
    },
    authenticationPreference: {
      Email: 0,
      GoogleAuthenticator: 1,
    },
    emailFrequency: {
      never: 0,
      everyQuarter: 1,
      everyMonth: 2,
      everyWeek: 3,
      everyDay: 4,
    },
    emailType: {
      NEW_ORGANIZATION: 'NEW_ORGANIZATION',
      REQUEST_ORGANIZATION: 'REQUEST_ORGANIZATION',
      ORGANIZATION_ACTIVATED: 'ORGANIZATION_ACTIVATED',
      VERIFY_AUTHENTICATION: 'VERIFY_AUTHENTICATION',
      INVITATION: 'INVITATION',
      LIST_ANALYSIS_SUCCESS: 'LIST_ANALYSIS_SUCCESS',
      LIST_ANALYSIS_RERUN_SUCCESS: 'LIST_ANALYSIS_RERUN_SUCCESS',
      LIST_ANALYSIS_ERROR: 'LIST_ANALYSIS_ERROR',
      // Sharing
      INTERNAL_LIST_DISABLE: 'INTERNAL_LIST_DISABLE',
      INTERNAL_LIST_ENABLE: 'INTERNAL_LIST_ENABLE',
      EXTERNAL_LIST_DISABLE: 'EXTERNAL_LIST_DISABLE',
      EXTERNAL_LIST_ENABLE: 'EXTERNAL_LIST_ENABLE',
      // GFW Lists
      UPDATE_GFWLISTS: 'UPDATE_GFWLISTS',
    },
    snsType: {
      NEW_ORGANIZATION: 'NEW_ORGANIZATION',
      UPDATE_GFWLIST: 'UPDATE_GFWLIST',
    },
    maxUserLoginRetries: 5,
  },
};
