export const listFeatureFlags = async () => {
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
    console.warn(error);
    return [];
  }
};

export const getFeatureFlag = async (id) => {
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
    console.warn(error);
    return {};
  }
};

export const createFeatureFlag = async (flagName, orgId = null) => {
  return updateFeatureFlag(flagName, true, orgId);
};

export const updateFeatureFlag = async (name, status, orgId = null) => {
  try {
    const response = await fetch(`/api/feature-flags`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        flagId: name,
        flagState: status,
        orgId: orgId,
      }),
    });
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.warn(error);
    return {};
  }
};
