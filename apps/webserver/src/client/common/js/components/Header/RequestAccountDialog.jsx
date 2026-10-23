import { useState } from 'react';
import { Link, Typography } from '@mui/material';
import CustomDialog from '../CustomDialog/CustomDialog';
import { PillButton } from '../../../../components';
import { useTransifexTranslation } from '../../../../hooks/useTransifexTranslation';
import './RequestAccountDialog.scss';

const TRANSITION_BLOG_URL =
  'https://pro-news.globalforestwatch.org/news-events/gfw-pro-is-consolidating-into-global-nature-watch';
const EXPORT_DATA_URL =
  'https://globalnaturewatch.org/help/gfw-pro/guides/share-receive-export-lists/';

function RequestAccountDialog() {
  const [open, setOpen] = useState(false);
  const translatedTitle = useTransifexTranslation('Request an account');
  const translatedHeading = useTransifexTranslation('GFW Pro retires December 31, 2026');
  const translatedBody = useTransifexTranslation(
    'GFW Pro, including the web interface and API, is consolidating into Global Nature Watch and will retire on December 31, 2026.'
  );
  const translatedTransitionPaths = useTransifexTranslation(
    'Global Nature Watch offers two self-service transition paths.'
  );
  const translatedReadBlog = useTransifexTranslation('Read the transition blog');
  const translatedAndPlanTo = useTransifexTranslation('and plan to');
  const translatedExportData = useTransifexTranslation('export your data');
  const translatedBeforeThen = useTransifexTranslation('before then, as data will be deleted.');
  const translatedGotIt = useTransifexTranslation('Got it');

  const handleClose = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className="header__request-account-button"
        onClick={() => setOpen(true)}
      >
        {translatedTitle}
      </button>
      <CustomDialog
        open={open}
        dialogActionConfirm={
          <PillButton variant="contained" size="small" onClick={handleClose}>
            {translatedGotIt}
          </PillButton>
        }
        dialogTitle={translatedTitle}
        dialogMessage={
          <>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {translatedHeading}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {translatedBody} {translatedTransitionPaths}{' '}
              <Link href={TRANSITION_BLOG_URL} target="_blank" rel="noopener noreferrer">
                {translatedReadBlog}
              </Link>{' '}
              {translatedAndPlanTo}{' '}
              <Link href={EXPORT_DATA_URL} target="_blank" rel="noopener noreferrer">
                {translatedExportData}
              </Link>{' '}
              {translatedBeforeThen}
            </Typography>
          </>
        }
      />
    </>
  );
}

export default RequestAccountDialog;
