import { IconButton } from '@mui/material';

const style = {
  root: {
    borderRadius: '100%',
    cursor: 'pointer',
  },
  icon: {
    pointerEvents: 'none',
  },
};

const GfwIconButton = (props) => {
  return (
    <IconButton
      {...props}
      className={`icon-button ${props.className ? props.className : ''} ${
        props.size ? `icon-button--${props.size}` : ''
      } ${props.variant ? `icon-button--${props.variant}` : ''}`}
      data-tip={props.datatip}
      data-for={props.datafor}
      onClick={props.onClick}
      disableTouchRipple={true}
      sx={{
        ...(props.style || style.root),
        '& > *': style.icon,
      }}
    >
      {props.icon}
    </IconButton>
  );
};

export default GfwIconButton;
