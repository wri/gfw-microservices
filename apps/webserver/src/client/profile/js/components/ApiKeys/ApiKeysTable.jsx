import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const COPIED_TO_CLIPBOARD_NOTIFICATION_TIME = 2000;

export default function ApiKeysTable({ keys }) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isCopied) setIsCopied(false);
    }, COPIED_TO_CLIPBOARD_NOTIFICATION_TIME);
    return () => clearTimeout(timeout);
  }, [isCopied]);

  const copyToClipBoard = (key) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(key).then(() => {
        setIsCopied(true);
      });
    } else {
      // Fallback for browsers that do not support Clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = key;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
    }
  };

  const deleteKey = (id) => {
    console.log(id);
  };

  const maskString = (str) => {
    return `${str.substring(0, 2)}********${str.substring(10)}`;
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow
            sx={{
              '& th': {
                backgroundColor: '#f7f7f7',
              },
            }}
          >
            <TableCell>Key</TableCell>
            <TableCell>Created</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {keys.map(({ key, creationDate, id }) => (
            <TableRow key={id}>
              <TableCell
                style={{ color: '#97bd3d', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => copyToClipBoard(key)}
              >
                {maskString(key)} <ContentCopyIcon style={{ height: '15px' }} />
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
                    Copied
                  </div>
                )}
              </TableCell>
              <TableCell>{creationDate}</TableCell>
              <TableCell
                style={{ color: '#97bd3d', cursor: 'pointer' }}
                onClick={() => deleteKey(id)}
              >
                DELETE
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
