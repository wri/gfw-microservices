import { Provider } from '@nestjs/common';

export const ConstantsConfigIds = {
  ACCOUNT_STATUS: Symbol('ACCOUNT_STATUS'),
  LIST_ACTIVITY_TYPE: Symbol('LIST_ACTIVITY_TYPE'),
  USER_ACTIVITY_TYPE: Symbol('USER_ACTIVITY_TYPE'),
};

export const ConstantsConfig: { [key: symbol]: Provider } = {
  [ConstantsConfigIds.ACCOUNT_STATUS]: {
    provide: ConstantsConfigIds.ACCOUNT_STATUS,
    useValue: {
      AccountRequested: 1,
      AccountActivated: 2,
      AccountDeactivated: 3,
      AccountUpdated: 4,
    },
  },
  [ConstantsConfigIds.LIST_ACTIVITY_TYPE]: {
    provide: ConstantsConfigIds.LIST_ACTIVITY_TYPE,
    useValue: {
      LocationUploadedToList: 13,
      LocationDeletedFromList: 14,
      LocationCopiedToList: 15,
      LocationUpdatedInList: 16,
      LocationMovedFromList: 17,
      ListCreated: 18,
      ListUpdate: 19,
      ListUpdateNew: 20,
      ListDeleted: 21,
      ListAnalyzing: 22,
      ListShared: 35,
      ListUnShared: 36,
      ListUnSharedWithAll: 37,
    },
  },
  [ConstantsConfigIds.USER_ACTIVITY_TYPE]: {
    provide: ConstantsConfigIds.USER_ACTIVITY_TYPE,
    useValue: {
      UserCreated: 5,
      UserUpdated: 6,
      UserLogin: 7,
      UserLogout: 8,
      UserActivated: 9,
      UserForgotPassword: 10,
      UserResetPassword: 11,
      UserDeactivated: 12,
    },
  },
};
