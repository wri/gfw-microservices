import { useState, useEffect } from 'react';
import { MenuItem, Select } from '@mui/material';
import { updateAdminSelections } from '../../actions/mapActions';
import * as analysisActions from '../../actions/analysisActions';
import GfwButton from '../../../../common/js/components/GfwButton';
import { getListOfCountries, getListOfStatesOrProvinces } from '../../../../api/map';
import { ThemeProvider } from '../../../../styles/ThemeProvider';
import store from '../../store';

const CountryOrRegionAnalysis = ({
  adminSelections,
  setAdmin,
  analyzeAdmin,
  subscribeAdmin,
  analysisResults,
}) => {
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOrProvinceOptions, setStateOrProvinceOptions] = useState([]);
  const [filterStr, setFilterStr] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedStateOrProvince, setSelectedStateOrProvince] = useState(null);

  useEffect(() => {
    getListOfCountries().then(({ countryOptions }) => {
      setCountryOptions(countryOptions);
    });
  }, []);

  useEffect(() => {
    if (adminSelections.country) {
      getListOfStatesOrProvinces(adminSelections.gadmId).then(({ stateOrProvinceOptions }) => {
        setStateOrProvinceOptions(stateOrProvinceOptions);
      });
    }
  }, [adminSelections.country]);

  const handleSetCountry = (evt) => {
    const selectedGadmId = evt.target.value;
    const country = countryOptions.find((c) => c.gid_0 === selectedGadmId);

    setSelectedCountry(country);
    setSelectedStateOrProvince(null);

    const adminUpdate = {
      country: country.name_0,
      gadmId: country.gid_0,
      stateOrProvince: '',
    };

    store.dispatch(updateAdminSelections(adminUpdate));
    setAdmin(country.name_0);
  };

  const handleSetStateOrProvince = (evt) => {
    const gid = evt.target.value;
    const stateOrProvince = stateOrProvinceOptions.find((p) => p.gid_1 === gid);
    setSelectedStateOrProvince(stateOrProvince);

    const baseGadmId = stateOrProvince?.gid_1.split('_')[0];

    store.dispatch(
      updateAdminSelections({
        country: selectedCountry.name_0,
        stateOrProvince: stateOrProvince.name_1,
        gadmId: baseGadmId,
      })
    );

    setAdmin({
      stateOrProvince: stateOrProvince.name_1,
    });
  };

  const handleAnalyzeAdmin = () => {
    const region = selectedStateOrProvince
      ? stateOrProvinceOptions.findIndex((c) => c.gid_1 === selectedStateOrProvince?.gid_1) + 1
      : '';
    analyzeAdmin({
      country: selectedCountry.gid_0,
      region,
    });
    store.dispatch(
      analysisActions.setAnalysisAdminArea({
        country: selectedCountry.gid_0,
        region,
      })
    );
  };

  const handleSubscribeAdmin = () => {
    // the endpoint /locations/getGFWListLocationsGlobalId expects the gadm id until the underscore
    const baseGadmId = selectedStateOrProvince?.gid_1.split('_')[0];
    subscribeAdmin({
      country: selectedCountry?.name_0,
      region: selectedStateOrProvince?.name_1,
      gadmId: baseGadmId,
    });
  };

  const filteredProvinces = stateOrProvinceOptions.filter(({ name_1 }) =>
    name_1?.toLowerCase().includes(filterStr.toLowerCase())
  );

  return (
    <ThemeProvider>
      <div className="aa">
        <div className="locations-add-subpage__content">
          <div className="select-administrative-region__country-dropdown dropdown-group">
            <Select
              sx={{ width: 200 }}
              value={selectedCountry?.gid_0 || ''}
              onChange={handleSetCountry}
              displayEmpty
              renderValue={(selected) =>
                selected
                  ? countryOptions.find((c) => c.gid_0 === selected)?.name_0
                  : 'SELECT COUNTRY'
              }
              data-testid="country-or-region-select"
            >
              <MenuItem value="" disabled>
                SELECT COUNTRY
              </MenuItem>
              {countryOptions.map(({ gid_0, name_0 }) => (
                <MenuItem key={gid_0} value={gid_0}>
                  {name_0}
                </MenuItem>
              ))}
            </Select>
          </div>

          {selectedCountry && (
            <>
              <div className="region-countries-search-container">
                <svg className="svg-icon">
                  <use xlinkHref="#icon-control-search" />
                </svg>
                <input
                  className="region-countries-search"
                  value={filterStr}
                  onChange={(e) => setFilterStr(e.target.value)}
                />
              </div>

              <div className="select-administrative-region__smaller-region-dropdown dropdown-group">
                <Select
                  sx={{ width: 200 }}
                  value={selectedStateOrProvince?.gid_1 || ''}
                  onChange={handleSetStateOrProvince}
                  displayEmpty
                  renderValue={(selected) =>
                    selected
                      ? stateOrProvinceOptions.find((c) => c.gid_1 === selected)?.name_1
                      : 'Select State/Province'
                  }
                >
                  <MenuItem value="" disabled>
                    Select State/Province
                  </MenuItem>
                  {filteredProvinces.map(({ gid_1, name_1 }) => (
                    <MenuItem key={gid_1} value={gid_1}>
                      {name_1}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </>
          )}
        </div>

        <div
          className={`select-administrative-region-actions ${
            analysisResults?.data ? 'hidden' : ''
          }`}
        >
          <GfwButton
            classNames="AnalysisPanel__button btn-green text__semi-bold-12"
            value="ANALYZE"
            disabled={!adminSelections.country}
            onClick={handleAnalyzeAdmin}
          />
          <GfwButton
            classNames="AnalysisPanel__button btn-green text__semi-bold-12"
            value="ADD LOCATION"
            disabled={!adminSelections.country}
            onClick={handleSubscribeAdmin}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default CountryOrRegionAnalysis;
