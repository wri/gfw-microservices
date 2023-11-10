import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ButtonGroup } from '@mui/material';
import AddButton from './addButton';

function FeatureFlags({ setIsLoading }) {
  const [rows, setrows] = useState([]);

  useEffect(() => {
    fetch(`/api/feature-flags/`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then(([data]) => {
        setrows(data);
      })
      .catch((error) => {
        console.log(error);
      });
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
