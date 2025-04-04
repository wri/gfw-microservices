export const getListOfCountries = async () => {
  try {
    const response = await fetch('/map/gadm-admininstrative-boundaries', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }

    const { data } = await response.json();
    return {
      countryOptions: data,
    };
  } catch (error) {
    console.error('Error fetching countries:', error);
    return {
      countryOptions: [],
    };
  }
};

export const getListOfStatesOrProvinces = async (countryCode) => {
  try {
    const response = await fetch(
      `/map/gadm-admininstrative-boundaries?countryCode=${countryCode}`,
      {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch states or provinces');
    }

    const { data } = await response.json();
    return {
      stateOrProvinceOptions: data,
    };
  } catch (error) {
    console.error(`Error fetching states or provinces for ${countryCode}:`, error);
    return {
      stateOrProvinceOptions: [],
    };
  }
};
