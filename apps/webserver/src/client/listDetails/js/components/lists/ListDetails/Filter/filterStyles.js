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
  flexGrow: 1,
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
    '&.Mui-disabled fieldset': {
      borderColor: 'lightgray',
    },
  },
  '& .MuiInputLabel-root': {
    color: gfwGreen,
    fontSize: '0.75rem',
    '&.Mui-focused': {
      color: gfwGreen,
    },
    '&.Mui-disabled': {
      color: 'lightgray',
    },
  },
  '& .MuiSelect-root.Mui-disabled': {
    backgroundColor: '#f5f5f5',
    color: 'lightgray',
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
