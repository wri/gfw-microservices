import filterCountryStateAndSubStateOptions from './filterCountryStateAndSubStateOptions';

describe('filterCountryStateAndSubStateOptions', () => {
  const filterValues = {
    USA: {
      California: ['Los Angeles', 'San Francisco'],
      Texas: ['Houston', 'Dallas'],
    },
    Canada: {
      Ontario: ['Toronto', 'Ottawa'],
      Quebec: ['Montreal', 'Quebec City'],
    },
    null: {},
  };

  it('should return filtered country, state, and substate lists when valid inputs are given', () => {
    const { countryList, stateList, subStateList } = filterCountryStateAndSubStateOptions(
      filterValues,
      'USA',
      'California'
    );

    expect(countryList).toEqual(['USA', 'Canada']);
    expect(stateList).toEqual(['California', 'Texas']);
    expect(subStateList).toEqual(['Los Angeles', 'San Francisco']);
  });

  it('should return empty state and substate lists if country is not selected', () => {
    const { countryList, stateList } = filterCountryStateAndSubStateOptions(
      filterValues,
      null,
      'California'
    );

    expect(countryList).toEqual(['USA', 'Canada']);
    expect(stateList).toEqual([]);
  });

  it('should return empty substate list if state is not selected', () => {
    const { countryList, stateList, subStateList } = filterCountryStateAndSubStateOptions(
      filterValues,
      'USA',
      null
    );

    expect(countryList).toEqual(['USA', 'Canada']);
    expect(stateList).toEqual(['California', 'Texas']);
    expect(subStateList).toEqual([]);
  });
});
