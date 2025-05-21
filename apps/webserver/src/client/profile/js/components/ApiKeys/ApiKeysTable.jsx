import {
  Table,
  TableCell,
  TableHead,
  TableBody,
  TableRow,
  TableContainer,
  Paper,
} from '@mui/material';

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
