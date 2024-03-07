import React from 'react';
import forest_change_locations from './columns/forest_change_locations';
import forest_change_analysis from './columns/forest_change_analysis';
import policy_locations from './columns/policy_locations';
import policy_analysis from './columns/policy_analysis';
import commodity_analysis from './columns/commodity_analysis';
import commodity_locations from './columns/commodity_locations';
import palm_oil_mill_fc from './columns/palm_oil_mill_fc';
import palm_oil_mill_cr from './columns/palm_oil_mill_cr';
import oil_palm_concession_fc from './columns/oil_palm_concession_fc';
import protected_area_fc from './columns/protected_area_fc';
import location_id from './columns/location_id';
import react_table__location_name from './columns/react_table__location_name';

const transifex = Transifex.live.translateText;

const columns = {
  forest_change_locations,
  forest_change_analysis,
  policy_locations,
  policy_analysis,
  commodity_locations,
  commodity_analysis,
  palm_oil_mill_fc,
  palm_oil_mill_cr,
  oil_palm_concession_fc,
  protected_area_fc,
  location_id,
  react_table__location_name,
  flags: [
    {
      name: 'General',
      field: 'flag_general',
    },
    {
      name: 'GLAD alerts',
      field: 'flag_glad',
    },
    {
      name: 'VIIRS active fires alerts',
      field: 'flag_viirs',
    },
  ],
};

export default columns;
