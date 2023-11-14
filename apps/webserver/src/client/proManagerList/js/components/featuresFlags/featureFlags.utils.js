export const listFeatureFlags = async () => {
    console.log('bla')
    try {
        const response = await fetch('/api/feature-flags', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            'Content-type': 'application/json',
        },
      });

      const { data } = await response.json();
      return data
    } catch (error) {
        console.warn(error);
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
      return data
    } catch (error) {
        console.warn(error);
    }
};

export const createFeatureFlag = async (flagName) => {
    try {
      const response = await fetch(`/api/feature-flags`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          flagId: flagName,
          orgId: selectedOrgId,
          flagState: true,
          modifierUserId,
        }),
      });
      const { data } = await response.json();
      return data
    } catch (error) {
      console.warn(error);
    }
};
  

  