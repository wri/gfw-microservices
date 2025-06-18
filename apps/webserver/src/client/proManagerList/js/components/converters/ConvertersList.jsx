import {
  useEffect,
  // useState
} from 'react';
import { Grid, Table, TableHead, TableBody, TableRow, TableContainer } from '@mui/material';
import { useConvertersContext } from './context/ConvertersContext';
import { StyledTableCell } from '../../common/styledTableCell';

export default function ConvertersList() {
  const { convertersList, isLoading, error, fetchConverters } = useConvertersContext();
  // const [selectedConverter, setSelectedConverter] = useState(null);

  useEffect(() => {
    fetchConverters();
  }, []);

  if (isLoading) {
    return <div>Loading converters...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }
  if (!convertersList.length) {
    return <div>No converters found</div>;
  }

  return (
    <Grid container spacing={2}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Details</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {convertersList.map((row) => (
              <TableRow
                // onClick={() => setSelectedConverter(row)}
                key={row}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  cursor: 'pointer',
                }}
              >
                <StyledTableCell>{row}</StyledTableCell>
                <StyledTableCell>{row}</StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
}
