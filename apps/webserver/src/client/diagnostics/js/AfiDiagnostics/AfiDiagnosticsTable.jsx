import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function AfiDiagnosticsTable({ data }) {
  return (
    <Paper elevation={3}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Country</TableCell>
            <TableCell align="right">Sub-state</TableCell>
            <TableCell align="right">Coverage (HA)</TableCell>
            <TableCell align="right">Natural Forest Loss (HA)</TableCell>
            <TableCell align="right">Negligible Risk</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((row) => (
            <TableRow key={row.subState}>
              <TableCell align="right">{row.country}</TableCell>
              <TableCell align="right">{row.subState}</TableCell>
              <TableCell align="right">{row.coverageHA}</TableCell>
              <TableCell align="right">{row.naturalForestLossHA}</TableCell>
              <TableCell align="right">{row.negligibleRisk ? 'YES' : 'No'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default AfiDiagnosticsTable;
