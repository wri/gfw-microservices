import { FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import { toggleNaturalForestLossDataSource } from '../../../../../../locations/js/actions/locationActions';
import store from '../../../../../../locations/js/store';
import InfoBubble from '../../../../../../common/js/components/InfoBubble';
import infoBubbleConfig from '../../../../../../common/js/infoBubbleConfig.constants';

import {
  SBTN_NATURAL_FOREST_LOSS,
  JRC_NATURAL_FOREST_LOSS,
} from '../deforestationDisplayFormat.constants';
import { selectStyle } from './filterStyles';

const NaturalForestLossDataSourceToggle = () => {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <FormControl variant="outlined" sx={{ ...selectStyle, width: 'auto' }}>
        <InputLabel sx={{ background: 'white', padding: '0px 10px' }}>Forest Dataset</InputLabel>
        <Select
          value={store.getState().naturalForestLossDataSource}
          sx={{ fontSize: '0.875rem' }}
          onChange={({ target }) => {
            store.dispatch(toggleNaturalForestLossDataSource(target.value));
          }}
        >
          <MenuItem
            key={JRC_NATURAL_FOREST_LOSS}
            value={JRC_NATURAL_FOREST_LOSS}
            data-cy="data-source-toggle-JRC"
          >
            JRC Global Forest Cover
          </MenuItem>
          <MenuItem
            key={SBTN_NATURAL_FOREST_LOSS}
            value={SBTN_NATURAL_FOREST_LOSS}
            data-cy="data-source-toggle-SBTN"
          >
            SBTN Natural Forest Loss
          </MenuItem>
        </Select>
      </FormControl>
      <InfoBubble infoBubbleId={infoBubbleConfig.post2020RiskForestLossDataset} />
    </Stack>
  );
};

export default NaturalForestLossDataSourceToggle;
