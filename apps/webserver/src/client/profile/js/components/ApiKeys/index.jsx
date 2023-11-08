import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Icon from '@material-ui/core/Icon';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Button from '../../../../common/js/components/Button';
import IconPlus from '../../../../common/js/components/icon/IconPlus';

const keysMock = [
  {
    id: 1,
    key: '1adf235312342311fad98',
    creationDate: new Date().toDateString(),
  },
];

export default function ApiKeys() {
  const [keys, setKeys] = useState({});
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipBoard = (key) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(key).then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 2000); // Hide the "copied" message after 2 seconds
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
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  const deleteKey = (id) => {
    console.log(id);
  };

  const maskString = (str) => {
    return `${str.substring(0, 2)}********${str.substring(10)}`;
  };

  return !keys.length ? (
    <div style={{ textAlign: 'center' }}>
      <Icon style={{ color: '#999999', fontSize: '70px' }} height="60px">
        api
      </Icon>
      <h3>Create your API Key</h3>
      <div>API keys allows users to access your API and view data from your locations.</div>
      <br />
      <Button
        variant="primary"
        className="users-section__action-button"
        onClick={() => {
          setKeys(keysMock);
        }}
        icon={<IconPlus height="10px" />}
        label={'Create'}
      />
    </div>
  ) : (
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
