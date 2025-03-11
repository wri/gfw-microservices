import React, { useState, useEffect } from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const COPIED_TO_CLIPBOARD_NOTIFICATION_TIME = 2000;

function ApiKeyRow({ deleteKey, apiKey, creationDate, id }) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let timeout;
    if (isCopied) {
      timeout = setTimeout(() => {
        setIsCopied(false);
      }, COPIED_TO_CLIPBOARD_NOTIFICATION_TIME);
    }
    return () => clearTimeout(timeout);
  }, [isCopied]);

  const copyToClipBoard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(apiKey).then(() => {
        setIsCopied(true);
      });
    } else {
      // Fallback for browsers that do not support Clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = apiKey;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
    }
  };

  const maskString = (str) => {
    return `${str.substring(0, 2)}********${str.substring(str.length - 5)}`;
  };

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <TableRow key={id}>
      <TableCell
        style={{ color: '#97bd3d', cursor: 'pointer', textDecoration: 'underline' }}
        onClick={copyToClipBoard}
      >
        {maskString(apiKey)} <ContentCopyIcon style={{ height: '15px' }} />
        {isCopied && (
          <div
            style={{
              color: 'white',
              background: 'black',
              textDecoration: 'none',
              position: 'fixed',
              borderRadius: '10%',
              padding: '2px',
              margin: '5px 100px',
            }}
          >
            Copied!
          </div>
        )}
      </TableCell>
      <TableCell>{formatDate(creationDate)}</TableCell>
      <TableCell style={{ color: '#97bd3d', cursor: 'pointer' }} onClick={() => deleteKey(id)}>
        DELETE
      </TableCell>
    </TableRow>
  );
}

export default ApiKeyRow;
