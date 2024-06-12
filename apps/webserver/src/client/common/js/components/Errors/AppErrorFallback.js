import React from 'react';
import catchContainer from './catchContainer';
import { styled } from '@mui/material/styles';
import BaseButton from '@mui/material/Button';
import notifyErrorToSlack from './notifyErrorToSlack';
import { ErrorDetails } from './ErrorUtility';

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

const Button = styled(BaseButton)({
  boxShadow: 'none',
  borderRadius: 4,
  borderColor: '#97bd3d',
  backgroundColor: '#97bd3d',
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '14px',
  '&:hover': {
    backgroundColor: '#789631',
    borderColor: '#789631',
    boxShadow: 'none',
  },
  '&:active': {
    boxShadow: 'none',
    backgroundColor: '#789631',
    borderColor: '#789631',
  },
  '&:focus': {
    boxShadow: '0 0 0 0.2rem rgba(0,123,255,.5)',
  },
});

const ButtonWrapper = styled('div')({
  padding: '0 16px 16px',
});

function AppErrorFallback({ error, children }) {
  if (error) {
    const page = errorPage[DEFAULT_LANGUAGE];
    return (
      <ErrorPage>
        <ErrorDialog>
          <ErrorTile>{page.title}</ErrorTile>
          <ErrorMessage>{page.message}</ErrorMessage>
          <ButtonWrapper>
            <Button variant="primary" onClick={() => (window.location.href = '/')}>
              Home Page
            </Button>
          </ButtonWrapper>
          {!isProduction && error.stack && <ErrorDetails>{error.stack}</ErrorDetails>}
        </ErrorDialog>
      </ErrorPage>
    );
  }

  return <>{children}</>;
}

export default catchContainer(AppErrorFallback, ErrorHandlerFn);
