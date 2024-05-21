import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import BetaTag from '../../../common/js/components/BetaTag';
import InfoBubble from '../../../common/js/components/InfoBubble';
import { locationsPage } from '../../../common/js/config';
import { forestLossDatasetIds } from './forestLossDatasets.constants';

function AfiDiagnosticsTable({ data, forestLossDataset = forestLossDatasetIds.STBN }) {
  const isStbnSelected = forestLossDataset === forestLossDatasetIds.STBN;
  /*
    if STBN is selected, the rows displayed should be coverageHA and naturalForestLossHA
    if JRC is selected the rows should be jrcCoverageHA and jrcNaturalForestLossHA and Negligible Risk should be hidden
  */
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Country</TableCell>
              <TableCell align="right">Sub-state</TableCell>
              <TableCell align="right">
                <span>Natural Forest Coverage (HA)</span>
                <BetaTag>(Beta)</BetaTag>
                <InfoBubble infoBubbleId={locationsPage.infoBubbleConfig.naturalForestCoverage} />
              </TableCell>
              <TableCell align="right">
                <span>Natural Forest Loss (HA)</span>
                <BetaTag>(Beta)</BetaTag>
                <InfoBubble infoBubbleId={locationsPage.infoBubbleConfig.naturalForestLoss} />
              </TableCell>
              {isStbnSelected && (
                <TableCell align="right">
                  Negligible Risk
                  <InfoBubble infoBubbleId={locationsPage.infoBubbleConfig.negligibleRisk} />
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((row) => (
              <TableRow key={row.subState}>
                <TableCell align="right">{row.country}</TableCell>
                <TableCell align="right">{row.subState}</TableCell>
                {isStbnSelected ? (
                  <>
                    <TableCell align="right">{row.coverageHA}</TableCell>
                    <TableCell align="right">{row.naturalForestLossHA}</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell align="right">{row.jrcCoverageHA}</TableCell>
                    <TableCell align="right">{row.jrcNaturalForestLossHA}</TableCell>
                  </>
                )}
                {isStbnSelected && (
                  <TableCell align="right">{row.negligibleRisk ? 'YES' : 'No'}</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default AfiDiagnosticsTable;
