import forest_change_analysis from './columns/forest_change_analysis';
import commodity_analysis from './columns/commodity_analysis';
import commodity_locations from './columns/commodity_locations';
import palm_oil_mill_fc from './columns/palm_oil_mill_fc';
import palm_oil_mill_cr from './columns/palm_oil_mill_cr';
import oil_palm_concession_fc from './columns/oil_palm_concession_fc';
import protected_area_fc from './columns/protected_area_fc';
import location_id from './columns/location_id';
import react_table__location_name from './columns/react_table__location_name';
import getPost2020Risk from './columns/post_2020_risk';
import draft_state_columns from './columns/draft_state_columns';
import id_type_columns from './columns/id_type_columns.js';
import alerts_analysis from './columns/alerts_analysis';

const columns = {
  id_type_columns,
  forest_change_analysis,
  alerts_analysis,
  commodity_locations,
  commodity_analysis,
  palm_oil_mill_fc,
  palm_oil_mill_cr,
  oil_palm_concession_fc,
  protected_area_fc,
  location_id,
  react_table__location_name,
  get post_2020_risk() {
    return getPost2020Risk();
  },
  draft_state_columns,
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
