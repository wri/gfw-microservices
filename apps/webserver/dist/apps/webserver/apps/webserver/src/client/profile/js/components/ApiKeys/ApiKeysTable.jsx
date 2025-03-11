import React from 'react';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import ApiKeyRow from './ApiKeyRow';

export default function ApiKeysTable({ keys, deleteKey }) {
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
            <TableCell>Creation Date</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {keys.map((key) => (
            <ApiKeyRow
              deleteKey={deleteKey}
              key={key.id}
              apiKey={key.apiKey}
              creationDate={key.creationDate}
              id={key.id}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
