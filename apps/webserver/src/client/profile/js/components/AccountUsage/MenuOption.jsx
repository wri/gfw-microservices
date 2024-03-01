import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function MenuOption(props) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open)
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleExport = () => {
    props.export();
    handleClose();
  }

  return (
    <div style={{float: 'right'}}>
      <IconButton onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>

      <Menu open={open} onClose={handleClose}>
        <MenuItem onClick={handleExport}>
          Export
        </MenuItem>
      </Menu>
    </div>
  );
}