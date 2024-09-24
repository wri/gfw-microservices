export const gfwGreen = '#97bd3d';

export const boxStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  p: 4,
  zIndex: 999,
};

export const selectStyle = {
  minWidth: 200,
  width: '100%',
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: gfwGreen,
    },
    '&:hover fieldset': {
      borderColor: gfwGreen,
    },
    '&.Mui-focused fieldset': {
      borderColor: gfwGreen,
    },
  },
  '& .MuiInputLabel-root': {
    color: gfwGreen,
    '&.Mui-focused': {
      color: gfwGreen,
    },
  },
};

export const multipleSelectStyles = {
  placeholder: (defaultStyles) => {
    return {
      ...defaultStyles,
      color: gfwGreen,
    };
  },
  control: (base) => ({
    ...base,
    border: `1.5px solid ${gfwGreen}`,
    boxShadow: 'none !important',
    '*': {
      boxShadow: 'none !important',
    },
    '&:hover': {
      border: `1.5px solid ${gfwGreen} !important`,
    },
  }),
};
