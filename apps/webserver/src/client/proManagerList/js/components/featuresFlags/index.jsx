import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import AddButton from './addButton';
import { listFeatureFlags } from './featureFlags.utils';
import FeatureFlag from './featureFlag';
import '../../../css/featureFlags.scss';

function FeatureFlags({ setIsLoading }) {
  const [rows, setrows] = useState([]);
  const [selectedFlag, setselectedFlag] = useState(1);

  useEffect(() => {
    listFeatureFlags().then((data) => {
      setrows(data);
    });
  }, []);

  setIsLoading(false);

  return (
    <>
      {!selectedFlag && (
        <div>
          <h3 style={{ float: 'left' }}>Features</h3>

          <AddButton />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  onClick={() => setselectedFlag(row.flagId)}
                  key={row.flagId}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>{row.flagId}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!!selectedFlag && (
        <FeatureFlag fladID={selectedFlag} handleBack={() => setselectedFlag(0)} />
      )}
    </>
  );
}

export default FeatureFlags;
