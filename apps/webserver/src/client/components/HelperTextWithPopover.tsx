import { useState, MouseEvent, ReactNode } from 'react';
import { Popover, Box, IconButton, SxProps, Theme } from '@mui/material';
import { Close, Info } from '@mui/icons-material';

interface HelperTextWithPopoverProps {
  label: ReactNode;
  children: ReactNode;
  sx?: SxProps<Theme>;
  isCloseButtonVisible?: boolean;
}

export function HelperTextWithPopover({
  label,
  sx,
  children,
  isCloseButtonVisible = false,
}: HelperTextWithPopoverProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handlePopoverOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => setAnchorEl(null);
  const isPopoverOpen = !!anchorEl;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 0.5,
          ...sx,
        }}
      >
        {label}
        <IconButton onClick={handlePopoverOpen} sx={{ p: 0 }} aria-label="open popover">
          <Info fontSize="small" />
        </IconButton>
      </Box>
      <Popover
        id={isPopoverOpen ? 'popover' : undefined}
        open={isPopoverOpen}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              ml: 2,
            },
          },
        }}
      >
        <>
          {children}
          {isCloseButtonVisible && (
            <IconButton
              onClick={handlePopoverClose}
              aria-label="close popover"
              sx={{ position: 'absolute', top: '2px', right: '2px' }}
            >
              <Close fontSize="small" />
            </IconButton>
          )}
        </>
      </Popover>
    </>
  );
}
