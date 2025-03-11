import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconDraftNote from '../icon/IconDraftNote';

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

export default function CustomTooltip({
  label,
  tooltipMessage,
  placement,
  iconWidth = 15,
  iconHeight = 18,
  style,
  children,
}) {
  return (
    <LightTooltip title={tooltipMessage} placement={placement} style={style} arrow>
      {children ? (
        children
      ) : (
        <span style={{ color: '#97bd3d', display: 'flex', alignItems: 'center', gap: 5 }}>
          {label && label}
          {<IconDraftNote width={iconWidth} height={iconHeight} />}
        </span>
      )}
    </LightTooltip>
  );
}
