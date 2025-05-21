import { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';

export default function AccountUsageDropMenu(props) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = () => {
    props.export();
    handleClose();
  };

  return (
    <div style={{ float: 'right' }}>
      <IconButton style={{ padding: 0 }} onClick={handleClick}>
        <MoreVert />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleExport}>Export</MenuItem>
      </Menu>
    </div>
  );
}
