import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import AddButton from './addButton';
import { listFeatureFlags } from './featureFlags.utils'

function FeatureFlags({ setIsLoading }) {
  const [rows, setrows] = useState([]);

  useEffect(() => {
    listFeatureFlags().then((data) => {
      setrows(data);
    })
  }, []);

  setIsLoading(false);
  return (
    <div>
      <h3>Features</h3>

      <AddButton />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell>{row.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default FeatureFlags;
