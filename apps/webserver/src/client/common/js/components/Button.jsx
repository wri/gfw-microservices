import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';

const style = {
  root: {
    borderRadius: '18px',
    cursor: 'pointer',
  },
  buttonStyle: {
    borderRadius: '18px',
    color: 'inherit',
  },
  overlay: {
    borderRadius: '18px',
    pointerEvents: 'none',
    backgroundColor: 'transparent',
    height: '100%',
  },
};

const Button = (props) => {
  return (
    <RaisedButton
      {...props}
      className={`button ${props.className ? props.className : ''} ${
        props.size ? `button--${props.size}` : ''
      } ${props.variant ? `button--${props.variant}` : ''}`}
      data-tip={props.datatip}
      data-for={props.datafor}
      onClick={props.onClick}
      disableTouchRipple={true}
      overlayStyle={style.overlay}
      style={{ ...style.root, ...props.style }}
      labelStyle={{ color: 'inherit', ...props.labelStyle }}
      buttonStyle={{ ...style.buttonStyle, ...props.buttonStyle }}
    />
  );
};

export default Button;
