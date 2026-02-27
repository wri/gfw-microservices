import { Button } from '@mui/material';

const LinkButton = (props) => {
  const { datatip, datafor, ...restProps } = props;

  return (
    <Button
      {...restProps}
      className={`link-button ${props.className ? props.className : ''} ${
        props.size ? `link-button--${props.size}` : ''
      } ${props.variant ? `link-button--${props.variant}` : ''}`}
      data-tip={datatip}
      data-for={datafor}
      disableRipple={true}
      sx={{
        borderRadius: '2px',
        cursor: 'pointer',
        padding: '2px',
        lineHeight: 1,
        height: 'auto',
        minWidth: 'none',
        textAlign: 'left',
        textTransform: 'none',
        textDecoration: 'underline',
        paddingLeft: 0,
        paddingRight: 0,
      }}
    />
  );
};

export default LinkButton;
