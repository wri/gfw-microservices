const filterCountryStateAndSubStateOptions = (filterValues, selectedCountry, selectedState) => {
  const countryList = Object.keys(filterValues).filter((name) => name !== 'null');

  const stateList =
    selectedCountry && selectedCountry in filterValues
      ? Object.keys(filterValues[selectedCountry])
      : [];

  const subStateList = selectedState ? filterValues[selectedCountry][selectedState] : [];

  return { countryList, stateList, subStateList };
};

export default filterCountryStateAndSubStateOptions;
