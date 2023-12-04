import React from 'react';
import { columnHeaders, locationsPage } from '../../../../common/js/config';
import CustomTooltip from '../../../../common/js/components/CustomTooltip/CustomTooltip';
import FailedTooltip from '../../../../common/js/components/CustomTooltip/FailedTooltip';
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
      if (cellInfo.original.location_status_id === 4) {
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
      if (cellInfo.original.location_status_id === 3) {
        // failed location
        return (
          <span
            title={cellInfo.original['Location Name'] || cellInfo.original['Investment Name']}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              justifyContent: 'space-between',
              fontStyle: 'italic',
              color: '#404041',
            }}
          >
            <span
              style={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {cellInfo.original['Location Name'] || cellInfo.original['Investment Name']}
            </span>
            <span className="my-lists-summary__icon-container">
              <FailedTooltip
                placement="top"
                label=""
                tooltipMessage={locationsPage.columns.tooltipMessage}
              />
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
