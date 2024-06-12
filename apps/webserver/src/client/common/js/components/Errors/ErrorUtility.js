import React from 'react';
import catchContainer from './catchContainer';
import { styled } from '@mui/material/styles';

export const ErrorDetails = styled('pre')({
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

function ErrorUtility({ error, children }) {
  if (error) {
    return <ErrorDetails>{error.stack}</ErrorDetails>;
  }

  return <>{children}</>;
}

export default catchContainer(ErrorUtility);
