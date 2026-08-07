import { Typography, Link, Theme } from '@mui/material';
import type { ReactNode } from 'react';
import { OpenInNew } from '@mui/icons-material';

type ExternalHelperResourceProps = {
  text: ReactNode;
  url: string;
  color: 'primary' | 'info';
};

const colors = {
  primary: {
    color: (theme: Theme) => theme.palette.primary[700],
    backgroundColor: (theme: Theme) => theme.palette.primary[200],
    border: (theme: Theme) => `1px solid ${theme.palette.primary.main}`,
  },
  info: {
    color: 'text.primary',
    backgroundColor: 'background.default',
    border: (theme: Theme) => `1px solid ${theme.palette.text.secondary}`,
  },
};

export function ExternalHelperResource({ text, url, color }: ExternalHelperResourceProps) {
  return (
    <Link
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        width: 'fit-content',
        height: 'fit-content',
        textDecoration: 'none',
        borderRadius: 1,
        py: 0.25,
        px: 1.5,
        '&:hover': {
          textDecoration: 'none',
        },
        ...colors[color],
      }}
      href={url}
      target="_blank"
    >
      <Typography variant="body2" lineHeight="0">
        {text}
      </Typography>
      <OpenInNew fontSize="small" />
    </Link>
  );
}
