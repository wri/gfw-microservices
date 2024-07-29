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

function AfiDiagnosticsTable({
  data,
  forestLossDataset = forestLossDatasetIds.STBN,
  isLocationLevel = false,
}) {
  const isStbnSelected = forestLossDataset === forestLossDatasetIds.STBN;
  /*
    if STBN is selected, the rows displayed should be coverageHA and naturalForestLossHA
    if JRC is selected the rows should be jrcCoverageHA and jrcNaturalForestLossHA and Negligible Risk should be hidden
  */
  return (
    <Card>
      <CardContent style={{overflow: 'auto'}}>
        <Table className='diagnostc__table'>
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
              <TableCell align="right">
                <span>Protected Area Overlap (HA)</span>
                <InfoBubble infoBubbleId={locationsPage.infoBubbleConfig.kpisProtectedAreas} />
              </TableCell>
              <TableCell align="right">
                <span>Indigenous Area Overlap (HA)</span>
                <InfoBubble infoBubbleId={locationsPage.infoBubbleConfig.deforestationKpisIndigenous} />
              </TableCell>
              {isStbnSelected && !isLocationLevel && (
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
                <TableCell align="right">{row.protectedAreasHA}</TableCell>
                <TableCell align="right">{row.landmarkHA}</TableCell>
                {isStbnSelected && !isLocationLevel && (
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
