import React, { useState, useEffect } from 'react';
import * as PropTypes from 'prop-types';
import { getListFilterValues } from '../../lists/getListFilterValues';
import './MultipleCountriesLabel.scss';

function MultipleCountriesLabel({ listId }) {
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    getListFilterValues(listId).then((filterValues) => {
      setCountries(Object.keys(filterValues));
    });
  }, [listId])
  

  const showAllCountriesToggle = () => {
    if (countries.length <= 3) {
      return;
    }
    setShowAllCountries(!showAllCountries);
  };

  const countriesToShow = showAllCountries ? countries : countries.slice(0, 3);
  let countriesNamesList = countriesToShow.join(', ');

  if (countries.length > 3 && !showAllCountries) {
    countriesNamesList = `${countriesNamesList}, ...`;
  }

  return (
    <button onClick={showAllCountriesToggle} type="button" className="diagnostics-countries-label">
      <div className={`${showAllCountries ? 'diagnostics-countries-label--show-all' : ''}`}>{countriesNamesList}</div>
    </button>
  );
}

MultipleCountriesLabel.propTypes = {
  countries: PropTypes.array,
};

export default MultipleCountriesLabel;
