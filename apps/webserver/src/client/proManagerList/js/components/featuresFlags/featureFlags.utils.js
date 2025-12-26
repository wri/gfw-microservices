import errorLogger from '../../../../common/js/utils/errorLogger';

export const getAllFeatureFlags = async () => {
  try {
    const response = await fetch('/api/feature-flags', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    });

    const { data } = await response.json();
    return data;
  } catch (error) {
    errorLogger.apiError(error, {
      endpoint: '/api/feature-flags',
      method: 'GET',
      component: 'FeatureFlags',
    });
    return [];
  }
};

export const getFeatureFlagsByFlagId = async (id) => {
  if (!id) {
    return [];
  }
  try {
    const response = await fetch(`/api/feature-flags/${id}`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    });
    const { data } = await response.json();
    return data;
  } catch (error) {
    errorLogger.apiError(error, {
      endpoint: `/api/feature-flags/${id}`,
      method: 'GET',
      component: 'FeatureFlags',
      flagId: id,
    });
    return [];
  }
};

export const upsertFeatureFlag = async ({ flagId, flagState, orgId = null }) => {
  try {
    const response = await fetch(`/api/feature-flags`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        flagId,
        flagState,
        orgId,
      }),
    });
    const { data } = await response.json();
    return data;
  } catch (error) {
    errorLogger.apiError(error, {
      endpoint: '/api/feature-flags',
      method: 'POST',
      component: 'FeatureFlags',
      flagId,
      flagState,
    });
    return {};
  }
};

export const getAccountListData = async () => {
  try {
    const response = await fetch(`/pro-manager-list/accounts`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    errorLogger.apiError(error, {
      endpoint: '/pro-manager-list/accounts',
      method: 'GET',
      component: 'ProManagerList',
    });
  }
};
