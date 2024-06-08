import React from 'react';
import CatchContainer from './CatchContainer';
import { styled } from '@mui/material/styles';
import notifyErrorToSlack from './notifyErrorToSlack';

const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';

const DEFAULT_LANGUAGE = 'en';
const errorPage = {
  en: {
    title: 'Oops! Something went wrong.',
    message: (
      <>
        We're sorry, but the page you're looking for is currently unavailable. Please try again
        later. If the problem persists, contact our support team at{' '}
        <a href="mailto:GFWProSupport@wri.org">GFWProSupport@wri.org</a>.
      </>
    ),
  },
};
function ErrorHandlerFn(error) {
  if (isProduction) {
    notifyErrorToSlack(error);
  }

  console.error(`%c GFWProError: ${error.message}`, 'font-weight:bold;', error.stack);
}

const ErrorPage = styled('div')({
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100vw',
  height: '100vh',
  backgroundColor: '#fbfcfa',
  display: 'flex',
});

const ErrorDialog = styled('main')({
  zIndex: '99999',
  backgroundColor: '#fff',
  maxWidth: '540px',
  borderRadius: '4px',
  borderColor: '#3d3d3d',
  boxSizing: 'border-box',
  alignSelf: 'center',
  margin: '0 auto',
  border: 'solid 1px #eeeeee',
});

const ErrorTile = styled('header')({
  fontWeight: '500',
  fontSize: '1.1em',
  padding: '16px',
  borderBottom: '1px solid #eeeeee',
});

const ErrorMessage = styled('div')({
  padding: '16px',
  '> a': {
    color: '#97bd3d',
    textDecoration: 'underline',
  },
});

const ErrorDetails = styled('pre')({
  fontFamily: 'monospace',
  padding: '16px',
  backgroundColor: '#fff4f4',
  fontSize: '14px',
  whiteSpace: 'pre-wrap',
  border: '1px solid #f00',
  wordWrap: 'break-word',
  marginBottom: '0',
  maxHeight: '340px',
  overflowY: 'scroll',
});

function AppErrorFallback({ error, children }) {
  if (error) {
    const strings = errorPage[DEFAULT_LANGUAGE];
    return (
      <ErrorPage>
        <ErrorDialog>
          <ErrorTile>{strings.title}</ErrorTile>
          <ErrorMessage>{strings.message}</ErrorMessage>
          {!isProduction && error.stack && (
            <ErrorDetails>
              {error.stack}
              <br />
              {error.stack}
            </ErrorDetails>
          )}
        </ErrorDialog>
      </ErrorPage>
    );
  }

  return <>{children}</>;
}

export default CatchContainer(AppErrorFallback, ErrorHandlerFn);
