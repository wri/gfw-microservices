import React from 'react';
import { withStyles, styled } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconBan from '../icon/IconBan';
import IconLimit from '../icon/IconLimit';

const BORDER = '1px solid #ccc';
const BACKGROUND_COLOR = '#fcfcfc';

const LightTooltip = withStyles(() => ({
  arrow: {
    '&::before': {
      border: BORDER,
      backgroundColor: BACKGROUND_COLOR,
    },
  },
  tooltip: {
    padding: '0.75rem',
    color: '#404041',
    border: BORDER,
    fontSize: 13,
    fontWeight: 400,
    backgroundColor: BACKGROUND_COLOR,
  },
}))(Tooltip);

const reasonMap = {
  default: {
    color: 'red',
    icon: <IconBan />,
  },
  limits: {
    color: 'orange',
    icon: <IconLimit />,
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
