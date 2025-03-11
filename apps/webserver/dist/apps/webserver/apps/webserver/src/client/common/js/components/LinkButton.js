import React from 'react';
import FlatButton from 'material-ui/FlatButton';

const style = {
  root: {
    borderRadius: '2px',
    cursor: 'pointer',
    padding: '2px',
    lineHeight: 1,
    height: 'auto',
    minWidth: 'none',
    textAlign: 'left',
  },
  label: {
    textTransform: 'none',
    textDecoration: 'underline',
    paddingLeft: 0,
    paddingRight: 0,
  },
};

const LinkButton = (props) => {
  return (
    <FlatButton
      {...props}
      className={`link-button ${props.className ? props.className : ''} ${
        props.size ? `link-button--${props.size}` : ''
      } ${props.variant ? `link-button--${props.variant}` : ''}`}
      data-tip={props.datatip}
      data-for={props.datafor}
      onClick={props.onClick}
      disableTouchRipple={true}
      labelStyle={style.label}
      style={style.root}
      rippleColor="transparent"
    />
  );
};

export default LinkButton;
