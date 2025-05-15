import type { SvgIconProps } from '@mui/material/SvgIcon';
import { Typography, Link } from '@mui/material';
import { Support, NorthEast } from '@mui/icons-material';

type ExternalHelperResourceProps = {
  text: string;
  url: string;
  color?: SvgIconProps['color'];
};

export function ExternalHelperResource({
  text,
  url,
  color = 'primary',
}: ExternalHelperResourceProps) {
  return (
    <Link
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        width: 'fit-content',
        textDecoration: 'none',
        color,
      }}
      href={url}
      target="_blank"
    >
      <Support fontSize="small" />
      <Typography variant="body2" color={color} lineHeight="0">
        {text}
      </Typography>
      <NorthEast fontSize="small" />
    </Link>
  );
}
