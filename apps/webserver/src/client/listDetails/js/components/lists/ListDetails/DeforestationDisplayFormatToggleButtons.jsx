import Button from '@mui/material/Button';
import { toggleDeforestationDisplayFormat } from '../../../../../locations/js/actions/locationActions';
import store from '../../../../../locations/js/store';
import {
  DISPLAY_FORMAT_SUMMARY,
  DISPLAY_FORMAT_HECTARES,
  DISPLAY_FORMAT_PERCENTAGE,
} from './deforestationDisplayFormat.constants';

function DeforestationDisplayFormatToggleButtons() {
  const { deforestationDisplayFormat } = store.getState();

  const getButtonStyles = (format) => ({
    color: '#000',
    backgroundColor: deforestationDisplayFormat === format ? '#e0e0e0' : '#f3f3ed',
    fontWeight: 'bold',
    border: '1px solid #ddd',
    padding: '6px 12px',
    '&:hover': {
      backgroundColor: '#e0e0e0',
    },
  });

  return (
    <>
      <Button
        sx={{
          ...getButtonStyles(DISPLAY_FORMAT_SUMMARY),
          borderTopLeftRadius: '50px',
          borderBottomLeftRadius: '50px',
        }}
        onClick={() => store.dispatch(toggleDeforestationDisplayFormat(DISPLAY_FORMAT_SUMMARY))}
        data-cy="deforestation-display-summary-format-button"
      >
        SUMMARY
      </Button>

      <Button
        sx={{
          ...getButtonStyles(DISPLAY_FORMAT_HECTARES),
          borderLeft: 'none',
          borderRadius: 0,
        }}
        onClick={() => store.dispatch(toggleDeforestationDisplayFormat(DISPLAY_FORMAT_HECTARES))}
        data-cy="deforestation-display-hectares-format-button"
      >
        HECTARES
      </Button>

      <Button
        sx={{
          ...getButtonStyles(DISPLAY_FORMAT_PERCENTAGE),
          borderLeft: 'none',
          borderTopRightRadius: '50px',
          borderBottomRightRadius: '50px',
        }}
        onClick={() => store.dispatch(toggleDeforestationDisplayFormat(DISPLAY_FORMAT_PERCENTAGE))}
        data-cy="deforestation-display-percentage-format-button"
      >
        % OF LOCATION
      </Button>
    </>
  );
}

export default DeforestationDisplayFormatToggleButtons;
