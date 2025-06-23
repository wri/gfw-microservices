import { locationsPage } from '../../../../common/js/config';
import { columnHeaders } from './columnHeaders.constants';
import CustomTooltip from '../../../../common/js/components/CustomTooltip/CustomTooltip';
import ColumnsHeader from '../../components/columns/ColumnsHeader';

const react_table__location_name = [
  {
    Header: () => <ColumnsHeader label={columnHeaders.locationName} />,
    accessor: (cellInfo) => {
      return cellInfo['Location Name'] || cellInfo['Investment Name'];
    },
    className: 'cell__Location-Name default-cell',
    show: true,
    width: 160,
    id: 'Location Name',
    sortMethod: (l, r) => {
      if (l && r) {
        return l.localeCompare(r);
      }
      return 0;
    },
    Cell: (cellInfo) => {
      if (cellInfo.original.analysisStatusId === 4) {
        const tooltipMessage = cellInfo.original.draftNonOwner
          ? locationsPage.columns.notAnalyzedList.nonOwner
          : locationsPage.columns.notAnalyzedList.owner;
        // draft location
        return (
          <span
            title={cellInfo.original['Location Name'] || cellInfo.original['Investment Name']}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              justifyContent: 'space-between',
              fontStyle: 'italic',
            }}
          >
            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {cellInfo.original['Location Name'] || cellInfo.original['Investment Name']}
            </span>
            <span className="DiagnosticStatusDraft__label_table">
              <CustomTooltip placement="top" label="" tooltipMessage={tooltipMessage} />
            </span>
          </span>
        );
      }
      return (
        <span title={cellInfo.original['Location Name'] || cellInfo.original['Investment Name']}>
          {cellInfo.original['Location Name'] || cellInfo.original['Investment Name']}
        </span>
      );
    },
  },
];

export default react_table__location_name;
