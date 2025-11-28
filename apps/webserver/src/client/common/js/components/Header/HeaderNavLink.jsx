import * as PropTypes from 'prop-types';
import { Box, Typography, styled, Tooltip, tooltipClasses } from '@mui/material';
import { Warning } from '@mui/icons-material';

import featureFlags from '../../../../../utils/general.utils';
const { isDcfAvailable } = featureFlags;

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
  if (isDcfAvailable && label === 'Alerts') {
    return (
      <CustomTooltip
        placement="bottom-end"
        title={
          <Typography variant="caption">
            Alerts Dashboard has moved. To view your data, open a list with Alerts analysis applied
            and select the 'Recent Deforestation Alerts' tab in the List Details page.
          </Typography>
        }
      >
        <Box className={'header__nav-link header__nav-link--inactive'}>
          <Warning fontSize="small" />
          <a className={className} aria-label={label}>
            {label}
          </a>
        </Box>
      </CustomTooltip>
    );
  }

  return (
    <a
      className={`header__nav-link ${
        active === link.replace('/', '') || active === true ? 'active' : ''
      } ${className}`}
      aria-label={label}
      href={link}
    >
      {label}
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
