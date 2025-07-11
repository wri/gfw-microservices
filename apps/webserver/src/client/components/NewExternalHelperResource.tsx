import { Typography, Link } from '@mui/material';
import { OpenInNew } from '@mui/icons-material';

type NewExternalHelperResourceProps = {
  text: string;
  url: string;
};

export function NewExternalHelperResource({ text, url }: NewExternalHelperResourceProps) {
  return (
    <Link
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        width: 'fit-content',
        textDecoration: 'none',
        backgroundColor: 'background.default',
        border: '1px solid black',
        borderRadius: 1,
        py: 0.25,
        px: 1.5,
        color: 'text.secondary',
        '&:hover': {
          textDecoration: 'none',
        },
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
