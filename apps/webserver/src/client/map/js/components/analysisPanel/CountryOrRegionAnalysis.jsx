import React, { useState, useEffect } from 'react';
import { executeQueryJSON } from '@arcgis/core/rest/query';
import Query from '@arcgis/core/rest/support/Query';
import { MenuItem, Select } from '@mui/material';
import { updateAdminSelections } from '../../actions/mapActions';
import * as analysisActions from '../../actions/analysisActions';
import GfwButton from '../../../../common/js/components/GfwButton';
import { getGadmService } from '../../../../common/js/utils/getGadmService.utils';
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
  const [selectedStateOrProvince, setSelectedStateOrProvince] = useState('');

  useEffect(() => {
    getListOfCountries().then(({ countryOptions }) => {
      setCountryOptions(countryOptions);
    });
  }, []);

  useEffect(() => {
    if (adminSelections.country) {
      getListOfStatesOrProvinces(adminSelections.countryISO).then(({ stateOrProvinceOptions }) => {
        setStateOrProvinceOptions(stateOrProvinceOptions);
      });
    }
  }, [adminSelections.country]);

  const handleSetCountry = (evt) => {
    const selectedISO = evt.target.value;
    const country = countryOptions.find((c) => c.iso === selectedISO);
    setSelectedCountry(country);
    setSelectedStateOrProvince('');

    const adminUpdate = {
      country: country.name_0,
      countryISO: country.iso,
      stateOrProvince: '',
    };

    store.dispatch(updateAdminSelections(adminUpdate));
    setAdmin(adminUpdate);
  };

  const handleSetStateOrProvince = (evt) => {
    const gid = evt.target.value;
    const province = stateOrProvinceOptions.find((p) => p.gid_1 === gid);
    setSelectedStateOrProvince(gid);

    store.dispatch(
      updateAdminSelections({
        country: selectedCountry.name_0,
        stateOrProvince: province.name_1,
      })
    );

    setAdmin({
      stateOrProvince: province.name_1,
    });
  };

  const handleAnalyzeAdmin = () => {
    const region = selectedStateOrProvince
      ? stateOrProvinceOptions.findIndex((c) => c.gid_1 === selectedStateOrProvince) + 1
      : '';
    analyzeAdmin({
      country: selectedCountry.iso,
      region,
    });
    store.dispatch(
      analysisActions.setAnalysisAdminArea({
        country: selectedCountry.iso,
        region,
      })
    );
  };

  const handleSubscribeAdmin = () => {
    // TODO: update to GADM 4.1
    const adminServiceURL = getGadmService();

    const queryUrl = adminServiceURL;

    const query = new Query();
    query.where =
      adminSelections.stateOrProvince.length !== 0
        ? `name_0 = '${adminSelections.country}' AND name_1 = '${adminSelections.stateOrProvince}'`
        : `name_0 = '${adminSelections.country}'`;

    query.returnGeometry = false;
    query.outFields = ['gadmid']; // ['name_0', 'name_1', 'name_2', 'gadmid'];// 'gadmid'

    executeQueryJSON(queryUrl, query).then((res) => {
      let gadmId =
        res && res.features && res.features.length > 0 ? res.features[0].attributes.gadmid : '';
      if (gadmId !== '') {
        const gadmLevels = gadmId.split('.');
        gadmId =
          adminSelections.stateOrProvince === ''
            ? gadmLevels[0]
            : `${gadmLevels[0]}.${gadmLevels[1]}`;
      }
      subscribeAdmin({
        country: adminSelections.country,
        region: adminSelections.stateOrProvince,
        gadmId,
      });
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
              value={selectedCountry?.iso || ''}
              onChange={handleSetCountry}
              displayEmpty
              renderValue={(selected) =>
                selected ? countryOptions.find((c) => c.iso === selected)?.name_0 : 'SELECT COUNTRY'
              }
            >
              <MenuItem value="" disabled>
                SELECT COUNTRY
              </MenuItem>
              {countryOptions.map(({ iso, name_0 }) => (
                <MenuItem key={iso} value={iso}>
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
                  value={selectedStateOrProvince}
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
