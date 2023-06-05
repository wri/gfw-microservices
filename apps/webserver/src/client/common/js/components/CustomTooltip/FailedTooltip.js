import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconBan from '../icon/IconBan';

const BORDER = '1px solid #ccc';
const BACKGROUND_COLOR = '#fcfcfc';

const LightTooltip = withStyles((theme) => ({
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

export default function FailedTooltip({
  tooltipMessage,
  placement,
  label,
  onClickAction = undefined,
}) {
  return (
    <LightTooltip
      style={{ color: 'red' }}
      title={tooltipMessage}
      placement={placement}
      arrow
      onClick={() => {
        if (onClickAction) {
          onClickAction();
        }
      }}
    >
      <span
        style={{
          height: 14,
          color: 'red',
          display: 'flex',
          alignContent: 'center',
          alignItems: 'center',
          gap: 5,
        }}
      >
        <IconBan />
        {label && label}
      </span>
    </LightTooltip>
  );
}
