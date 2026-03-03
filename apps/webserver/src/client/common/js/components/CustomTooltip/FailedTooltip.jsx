import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import ReportIcon from '@mui/icons-material/Report';
import IconBan from '../icon/IconBan';
import IconLimit from '../icon/IconLimit';
import '../../../css/failed-list-tooltip.scss';

const BORDER = '1px solid #ccc';
const BACKGROUND_COLOR = '#fcfcfc';

const LightTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .MuiTooltip-arrow`]: {
    '&::before': {
      border: BORDER,
      backgroundColor: BACKGROUND_COLOR,
    },
  },
  [`& .MuiTooltip-tooltip`]: {
    padding: '0.75rem',
    color: '#404041',
    border: BORDER,
    fontSize: 13,
    fontWeight: 400,
    backgroundColor: BACKGROUND_COLOR,
  },
}));

const reasonMap = {
  default: {
    color: 'red',
    icon: <IconBan />,
  },
  limits: {
    color: 'orange',
    icon: <IconLimit />,
  },
  'failed-location': {
    color: 'red',
    icon: <ReportIcon />,
  },
};

export default function FailedTooltip({
  tooltipMessage,
  placement,
  label,
  onClickAction = undefined,
  reason = 'default',
}) {
  const config = reasonMap[reason];

  return (
    <LightTooltip
      style={{ color: config.color }}
      title={tooltipMessage}
      placement={placement}
      arrow
      onClick={() => {
        if (onClickAction) {
          onClickAction();
        }
      }}
    >
      <span className={`failed-tooltip failed-tooltip--${reason}`}>
        {config.icon}
        {label && label}
      </span>
    </LightTooltip>
  );
}
