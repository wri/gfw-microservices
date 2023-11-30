import React from 'react';
import { columnHeaders } from '../../../../common/js/config';
import { checkValid, locationIsActive } from '../../../../locations/js/utils/locationsTableUtils';
import ColumnsHeader from '../../components/columns/ColumnsHeader';

const renderCell = (row) => {
  !locationIsActive(row.original) ? (
    '--'
  ) : checkValid(row.value) ? (
    <div className={`list-icons-container ${row.value !== 0 ? 'orange' : 'green'}`}>
      <svg className="list-icons">
        <use className="analysis-header-click" xlinkHref="#circle-list" />
      </svg>
    </div>
  ) : (
    '--'
  );
};

const policy_analysis = [
  {
    Header: () => (
      <div className="react-table-policy-categories">
        <ColumnsHeader label={columnHeaders.policyCategories} />
      </div>
    ),
    columns: [
      {
        Header: () => <ColumnsHeader label={columnHeaders.protectedAreas} />,
        accessor: 'protected_areas',
        show: true,
        width: 75,
        maxWidth: 75,
        Cell: (row) => renderCell(row),
      },
      {
        Header: () => <ColumnsHeader label={columnHeaders.naturalHabitatProxies} />,
        accessor: 'natural_habit_proxies',
        show: true,
        width: 75,
        maxWidth: 75,
        Cell: (row) => renderCell(row),
      },
      {
        Header: () => <ColumnsHeader label={columnHeaders.criticalHabitatProxy} />,
        accessor: 'critical_habitat_alliance_zero',
        show: true,
        width: 75,
        maxWidth: 75,
        Cell: (row) => renderCell(row),
      },
      {
        Header: () => <ColumnsHeader label={columnHeaders.indiginousPeoples} />,
        accessor: 'indigenous_people_land_rights',
        show: true,
        width: 100,
        maxWidth: 100,
        Cell: (row) => renderCell(row),
      },
      {
        Header: () => <ColumnsHeader label={columnHeaders.peat} />,
        accessor: 'peat',
        show: true,
        width: 75,
        maxWidth: 75,
        Cell: (row) => renderCell(row),
      },
      {
        Header: () => <ColumnsHeader label={columnHeaders.fires} />,
        accessor: 'fires',
        show: true,
        width: 75,
        maxWidth: 75,
        Cell: (row) => renderCell(row),
      },
    ],
  },
];

export default policy_analysis;
