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
    console.error(error);
    return [];
  }
};

export const getFeatureFlagsByFlagId = async (id) => {
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
    console.error(error);
    return {};
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
    console.error(error);
    return {};
  }
};

export const createFeatureFlag = async (flagName, orgId = null) => {
  try {
    const response = await fetch(`/api/feature-flags`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        flagId: flagName,
        flagState: true,
        orgId,
      }),
    });
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error(error);
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
    console.error(error);
  }
};
