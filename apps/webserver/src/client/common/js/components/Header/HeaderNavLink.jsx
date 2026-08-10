import * as PropTypes from 'prop-types';
import { Box, Typography, styled, Tooltip, tooltipClasses } from '@mui/material';
import { Warning } from '@mui/icons-material';
import { useTransifexTranslation } from '../../../../hooks/useTransifexTranslation';

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.primary[300],
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.primary[300],
    color: theme.palette.primary[900],
  },
}));

function HeaderNavLink({ active, link, label, className = '' }) {
  const translatedLabel = useTransifexTranslation(label);
  const alertsTooltip = useTransifexTranslation(
    "Alerts Dashboard has moved. To view your data, open a list with Alerts analysis applied and select the 'Recent Disturbance Alerts' tab in the List Details page."
  );

  if (label === 'Alerts') {
    return (
      <CustomTooltip
        placement="bottom-end"
        title={<Typography variant="caption">{alertsTooltip}</Typography>}
      >
        <Box className={'header__nav-link header__nav-link--inactive'}>
          <Warning fontSize="small" />
          <span className={className} aria-label={translatedLabel}>
            {translatedLabel}
          </span>
        </Box>
      </CustomTooltip>
    );
  }

  return (
    <a
      className={`header__nav-link ${
        active === link.replace('/', '') || active === true ? 'active' : ''
      } ${className}`}
      aria-label={translatedLabel}
      href={link}
    >
      {translatedLabel}
    </a>
  );
}

HeaderNavLink.propTypes = {
  active: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  link: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
};

HeaderNavLink.defaultProps = {
  className: '',
  active: false,
};

export default HeaderNavLink;
