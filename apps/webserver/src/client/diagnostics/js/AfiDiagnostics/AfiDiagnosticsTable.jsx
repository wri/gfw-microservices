import { Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

import InfoBubble from '../../../common/js/components/InfoBubble';
import { forestLossDatasetIds } from './forestLossDatasets.constants';
import infoBubbleConfig from '../../../common/js/constants/info-bubble-config.constants';

function AfiDiagnosticsTable({
  data,
  forestLossDataset = forestLossDatasetIds.SBTN,
  isLocationLevel = false,
}) {
  const isSbtnSelected = forestLossDataset === forestLossDatasetIds.SBTN;
  /*
    if SBTN is selected, the rows displayed should be coverageHA and naturalForestLossHA
    if JRC is selected the rows should be jrcCoverageHA and jrcNaturalForestLossHA and Negligible Risk should be hidden
  */
  return (
    <Card>
      <CardContent style={{ overflow: 'auto' }}>
        <Table className="diagnostc__table">
          <TableHead>
            <TableRow>
              {!isLocationLevel && (
                <>
                  <TableCell>Country</TableCell>
                  <TableCell align="right">Sub-state</TableCell>
                </>
              )}
              <TableCell align="right">
                <span>Natural Forest Coverage (HA)</span>
                <InfoBubble infoBubbleId={infoBubbleConfig.naturalForestCoverage} />
              </TableCell>
              <TableCell align="right">
                <span>Natural Forest Loss (HA)</span>
                <InfoBubble infoBubbleId={infoBubbleConfig.naturalForestLoss} />
              </TableCell>
              <TableCell align="right">
                <span>Protected Area Overlap (HA)</span>
                <InfoBubble infoBubbleId={infoBubbleConfig.kpisProtectedAreas} />
              </TableCell>
              <TableCell align="right">
                <span>Indigenous Area Overlap (HA)</span>
                <InfoBubble infoBubbleId={infoBubbleConfig.deforestationKpisIndigenous} />
              </TableCell>
              {isSbtnSelected && !isLocationLevel && (
                <TableCell align="right">
                  Negligible Risk
                  <InfoBubble infoBubbleId={infoBubbleConfig.negligibleRisk} />
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((row) => (
              <TableRow key={row.subState}>
                {!isLocationLevel && (
                  <>
                    <TableCell align="right">{row.country}</TableCell>
                    <TableCell align="right">{row.subState || '--'}</TableCell>
                  </>
                )}
                {isSbtnSelected ? (
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
                {isSbtnSelected && !isLocationLevel && (
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
