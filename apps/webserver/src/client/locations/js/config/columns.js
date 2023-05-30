/* eslint-disable react/display-name */
import React from 'react';

import IconButtonWrapper from '../components/IconButtonWrapper';
import { columnHeaders, locationsPage } from '../../../common/js/config';
import CustomTooltip from '../../../common/js/components/CustomTooltip/CustomTooltip';
import FailedTooltip from '../../../common/js/components/CustomTooltip/FailedTooltip';
import {
  sortAlphaNum,
  sortByNone,
  checkValid,
  formatDigit,
  getValue,
  getValidatedValue,
  getLastValue,
} from '../utils/locationsTableUtils';

const transifex = Transifex.live.translateText;

const columns = {
  forest_change_locations: [
    {
      id: 'total_area',
      Header: () => (
        <span className="title-text" title={transifex('Size in ha')}>
          {transifex('Size')} <span className="title-text__units">{transifex('(ha)')}</span>
        </span>
      ),
      accessor: (d) => {
        return d;
      },
      Cell: (row) => {
        return row.value.location_status_id === 2
          ? checkValid(row.value.total_area)
            ? formatDigit(row.value.total_area)
            : 0
          : '--';
      },
      sortMethod: (a, b) => {
        let returnValue = 0;
        if (a.location_status_id !== 2 && b.location_status_id === 2) {
          returnValue = -1;
        } else if (a.location_status_id !== 2 && b.location_status_id !== 2) {
          returnValue = 0;
        } else if (a.location_status_id === 2 && b.location_status_id !== 2) {
          returnValue = 1;
        } else if (a.location_status_id === 2 && b.location_status_id === 2) {
          returnValue = a.total_area - b.total_area;
        } else {
          returnValue = 0;
        }

        return returnValue;
      },
      className: 'td-num',
      show: true,
    },
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.commodity)}>
          {transifex(columnHeaders.commodity)}
        </span>
      ),
      accessor: 'Commodity',
      className: 'default-cell',
      show: true,
      width: 100,
      maxWidth: 100,
      Cell: (row) =>
        checkValid(row.value) ? (
          <span title={transifex(row.value)}>{transifex(row.value)}</span>
        ) : (
          '--'
        ),
    },
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.state)}>
          {transifex(columnHeaders.state)}
        </span>
      ),
      accessor: 'State',
      className: 'cell__State default-cell',
      show: true,
      width: 150,
      maxWidth: 150,
      Cell: (row) =>
        checkValid(row.value) ? (
          <span title={transifex(row.value)}>{transifex(row.value)}</span>
        ) : (
          '--'
        ),
      sortMethod: sortByNone,
    },
  ],
  forest_change_analysis: [
    {
      id: 'tree_cover_extent_total',
      Header: () => (
        <span>
          <span className="title-text" title={transifex(columnHeaders.treeCoverExtentInHa)}>
            {transifex(columnHeaders.treeCoverExtent)}{' '}
            <span className="title-text__units">(ha)</span>
          </span>
        </span>
      ),
      accessor: (d) => {
        return d;
      },
      className: 'default-cell td-num',
      show: true,
      width: 100,
      maxWidth: 115,
      Cell: (row) => {
        return row.value.location_status_id !== 2 ? (
          '--'
        ) : checkValid(row.value.tree_cover_extent_total) ? (
          <span title={formatDigit(row.value.tree_cover_extent_total)}>
            {formatDigit(row.value.tree_cover_extent_total)}
          </span>
        ) : (
          '--'
        );
      },
      sortMethod: (a, b) => {
        let returnValue = 0;
        if (a.location_status_id !== 2 && b.location_status_id === 2) {
          returnValue = -1;
        } else if (a.location_status_id !== 2 && b.location_status_id !== 2) {
          returnValue = 0;
        } else if (a.location_status_id === 2 && b.location_status_id !== 2) {
          returnValue = 1;
        } else if (a.location_status_id === 2 && b.location_status_id === 2) {
          returnValue = a.tree_cover_extent_total - b.tree_cover_extent_total;
        } else {
          returnValue = 0;
        }

        return returnValue;
      },
    },
    {
      Header: () => (
        <div className="react-table-tree-cover-loss">
          <span className="title-text" title={transifex(columnHeaders.treeCoverLossInHa)}>
            {transifex(columnHeaders.treeCoverLoss)} <span className="title-text__units">(ha)</span>
            <IconButtonWrapper id={locationsPage.infoBubbleConfig.lossAllYears} />
          </span>
        </div>
      ),
      columns: [
        {
          id: 'tree_cover_loss_total_yearly',
          Header: () => (
            <span className="title-text" title={transifex(columnHeaders.total)}>
              {transifex(columnHeaders.total)}
            </span>
          ),
          accessor: (d) => {
            return d;
          },
          className: 'default-cell td-num',
          show: true,
          Cell: (row) => {
            return row.value.location_status_id === 2 ? (
              checkValid(row.value.tree_cover_loss_total_yearly) ? (
                <span title={getValue(row.value.tree_cover_loss_total_yearly)}>
                  {getValue(row.value.tree_cover_loss_total_yearly)}
                </span>
              ) : (
                0
              )
            ) : (
              '--'
            );
          },
          sortMethod: (a, b) => {
            let returnValue = 0;
            if (a.location_status_id !== 2 && b.location_status_id === 2) {
              returnValue = -1;
            } else if (a.location_status_id !== 2 && b.location_status_id !== 2) {
              returnValue = 0;
            } else if (a.location_status_id === 2 && b.location_status_id !== 2) {
              returnValue = 1;
            } else if (a.location_status_id === 2 && b.location_status_id === 2) {
              returnValue =
                Object.values(JSON.parse(a.tree_cover_loss_total_yearly)).reduce(
                  (aa, bb) => aa + bb,
                  0
                ) -
                Object.values(JSON.parse(b.tree_cover_loss_total_yearly)).reduce(
                  (aa, bb) => aa + bb,
                  0
                );
            } else {
              returnValue = 0;
            }

            return returnValue;
          },
        },
        {
          id: 'tree_cover_loss_protected_areas_yearly',
          Header: () => (
            <span className="title-text" title={transifex(columnHeaders.protectedAreas)}>
              {transifex(columnHeaders.protectedAreas)}
            </span>
          ),
          accessor: (d) => {
            return d;
          },
          className: 'default-cell td-num',
          show: true,
          Cell: (row) => {
            return row.value.location_status_id === 2 ? (
              checkValid(row.value.tree_cover_loss_protected_areas_yearly) ? (
                <span
                  title={getValidatedValue(
                    row.value.tree_cover_loss_protected_areas_yearly,
                    row.value.protected_areas_area
                  )}
                >
                  {getValidatedValue(
                    row.value.tree_cover_loss_protected_areas_yearly,
                    row.value.protected_areas_area
                  )}
                </span>
              ) : (
                0
              )
            ) : (
              '--'
            );
          },
          sortMethod: (a, b) => {
            let returnValue = 0;
            if (a.location_status_id !== 2 && b.location_status_id === 2) {
              returnValue = -1;
            } else if (a.location_status_id !== 2 && b.location_status_id !== 2) {
              returnValue = 0;
            } else if (a.location_status_id === 2 && b.location_status_id !== 2) {
              returnValue = 1;
            } else if (a.location_status_id === 2 && b.location_status_id === 2) {
              returnValue =
                Object.values(JSON.parse(a.tree_cover_loss_protected_areas_yearly)).reduce(
                  (aa, bb) => aa + bb,
                  0
                ) -
                Object.values(JSON.parse(b.tree_cover_loss_protected_areas_yearly)).reduce(
                  (aa, bb) => aa + bb,
                  0
                );
            } else {
              returnValue = 0;
            }

            return returnValue;
          },
        },
        {
          id: 'tree_cover_loss_primary_forest_yearly',
          Header: () => (
            <span className="title-text" title={transifex(columnHeaders.primaryForest)}>
              {transifex(columnHeaders.primaryForest)}
            </span>
          ),
          accessor: (d) => {
            return d;
          },
          className: 'default-cell td-num',
          show: true,
          Cell: (row) => {
            return row.value.location_status_id === 2 ? (
              checkValid(row.value.tree_cover_loss_primary_forest_yearly) ? (
                <span
                  title={getValidatedValue(
                    row.value.tree_cover_loss_primary_forest_yearly,
                    row.value.natural_habitat_primary
                  )}
                >
                  {getValidatedValue(
                    row.value.tree_cover_loss_primary_forest_yearly,
                    row.value.natural_habitat_primary
                  )}
                </span>
              ) : (
                0
              )
            ) : (
              '--'
            );
          },
          sortMethod: (a, b) => {
            let returnValue = 0;
            if (a.location_status_id !== 2 && b.location_status_id === 2) {
              returnValue = -1;
            } else if (a.location_status_id !== 2 && b.location_status_id !== 2) {
              returnValue = 0;
            } else if (a.location_status_id === 2 && b.location_status_id !== 2) {
              returnValue = 1;
            } else if (a.location_status_id === 2 && b.location_status_id === 2) {
              returnValue =
                Object.values(JSON.parse(a.tree_cover_loss_primary_forest_yearly)).reduce(
                  (aa, bb) => aa + bb,
                  0
                ) -
                Object.values(JSON.parse(b.tree_cover_loss_primary_forest_yearly)).reduce(
                  (aa, bb) => aa + bb,
                  0
                );
            } else {
              returnValue = 0;
            }

            return returnValue;
          },
        },
      ],
    },
  ],
  // TODO: ADD STYLE AND HEADERSTYLE TO EACH POLICY CELL WHEN ADDING IT BACK IN
  policy_locations: [
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.locationName)}>
          {transifex(columnHeaders.locationName)}
        </span>
      ),
      accessor: 'Location Name',
      show: true,
      width: 130,
      maxWidth: 130,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
      sortMethod: sortAlphaNum,
    },
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.sizeInHa)}>
          {transifex(columnHeaders.size)} <span className="title-text__units">(ha)</span>
        </span>
      ),
      accessor: 'total_area',
      className: 'td-num',
      show: true,
      width: 75,
      maxWidth: 75,
      Cell: (row) =>
        checkValid(row.value) ? (
          <span title={formatDigit(row.value)}>{formatDigit(row.value)}</span>
        ) : (
          '--'
        ),
    },
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.commodity)}>
          {transifex(columnHeaders.commodity)}
        </span>
      ),
      accessor: 'Commodity',
      show: true,
      width: 100,
      maxWidth: 100,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    },
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.certified)}>
          {transifex(columnHeaders.certified)}
        </span>
      ),
      accessor: 'Certified',
      show: true,
      width: 100,
      maxWidth: 100,
      Cell: (row) =>
        checkValid(row.value) ? (
          row.original.Certification.toLowerCase() === 'yes' ? (
            transifex(row.original.Certification)
          ) : (
            <div className="list-icons-container">
              <svg className="list-icons">
                <use className="analysis-header-click" xlinkHref="#shape-close" />
              </svg>
            </div>
          )
        ) : (
          '--'
        ),
    },
  ],
  policy_analysis: [
    {
      Header: () => (
        <div className="react-table-policy-categories">
          <span className="title-text" title={transifex(columnHeaders.policyCategories)}>
            {transifex(columnHeaders.policyCategories)}
          </span>
        </div>
      ),
      columns: [
        {
          Header: () => (
            <span className="title-text" title={transifex(columnHeaders.protectedAreas)}>
              {transifex(columnHeaders.protectedAreas)}
            </span>
          ),
          accessor: 'protected_areas',
          show: true,
          width: 75,
          maxWidth: 75,
          Cell: (row) =>
            row.original.location_status_id !== 2 ? (
              '--'
            ) : checkValid(row.value) ? (
              <div className={`list-icons-container ${row.value !== 0 ? 'orange' : 'green'}`}>
                <svg className="list-icons">
                  <use className="analysis-header-click" xlinkHref="#circle-list" />
                </svg>
              </div>
            ) : (
              '--'
            ),
        },
        {
          Header: () => (
            <span className="title-text" title={transifex(columnHeaders.naturalHabitatProxies)}>
              {transifex(columnHeaders.naturalHabitatProxies)}
            </span>
          ),
          accessor: 'natural_habit_proxies',
          show: true,
          width: 75,
          maxWidth: 75,
          Cell: (row) =>
            row.original.location_status_id !== 2 ? (
              '--'
            ) : checkValid(row.value) ? (
              <div className={`list-icons-container ${row.value !== 0 ? 'orange' : 'green'}`}>
                <svg className="list-icons">
                  <use className="analysis-header-click" xlinkHref="#circle-list" />
                </svg>
              </div>
            ) : (
              '--'
            ),
        },
        {
          Header: () => (
            <span className="title-text" title={transifex(columnHeaders.criticalHabitatProxy)}>
              {transifex(columnHeaders.criticalHabitatProxy)}
            </span>
          ),
          accessor: 'critical_habitat_alliance_zero',
          show: true,
          width: 75,
          maxWidth: 75,
          Cell: (row) =>
            row.original.location_status_id !== 2 ? (
              '--'
            ) : checkValid(row.value) ? (
              <div className={`list-icons-container ${row.value !== 0 ? 'orange' : 'green'}`}>
                <svg className="list-icons">
                  <use className="analysis-header-click" xlinkHref="#circle-list" />
                </svg>
              </div>
            ) : (
              '--'
            ),
        },
        {
          Header: () => (
            <span className="title-text" title={transifex(columnHeaders.indiginousPeoples)}>
              {transifex(columnHeaders.indiginousPeoples)}
            </span>
          ),
          accessor: 'indigenous_people_land_rights',
          show: true,
          width: 100,
          maxWidth: 100,
          Cell: (row) =>
            row.original.location_status_id !== 2 ? (
              '--'
            ) : checkValid(row.value) ? (
              <div className={`list-icons-container ${row.value !== 0 ? 'orange' : 'green'}`}>
                <svg className="list-icons">
                  <use className="analysis-header-click" xlinkHref="#circle-list" />
                </svg>
              </div>
            ) : (
              '--'
            ),
        },
        {
          Header: () => (
            <span className="title-text" title={transifex(columnHeaders.peat)}>
              {transifex(columnHeaders.peat)}
            </span>
          ),
          accessor: 'peat',
          show: true,
          width: 75,
          maxWidth: 75,
          Cell: (row) =>
            row.original.location_status_id !== 2 ? (
              '--'
            ) : checkValid(row.value) ? (
              <div className={`list-icons-container ${row.value !== 0 ? 'orange' : 'green'}`}>
                <svg className="list-icons">
                  <use className="analysis-header-click" xlinkHref="#circle-list" />
                </svg>
              </div>
            ) : (
              '--'
            ),
        },
        {
          Header: () => (
            <span className="title-text" title={transifex(columnHeaders.fires)}>
              {transifex(columnHeaders.fires)}
            </span>
          ),
          accessor: 'fires',
          show: true,
          width: 75,
          maxWidth: 75,
          Cell: (row) =>
            row.original.location_status_id !== 2 ? (
              '--'
            ) : checkValid(row.value) ? (
              <div className={`list-icons-container ${row.value !== 0 ? 'orange' : 'green'}`}>
                <svg className="list-icons">
                  <use className="analysis-header-click" xlinkHref="#circle-list" />
                </svg>
              </div>
            ) : (
              '--'
            ),
        },
      ],
    },
  ],
  commodity_locations: [
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.rspo)}>
          {transifex(columnHeaders.rspo)}
        </span>
      ),
      accessor: 'Certification',
      show: true,
      width: 75,
      maxWidth: 75,
      Cell: (row) =>
        checkValid(row.value) && row.value.includes('RSPO') ? (
          <div className="list-icons-container black">
            <svg className="list-icons">
              <use className="analysis-header-click" xlinkHref="#rspo-check" />
            </svg>
          </div>
        ) : (
          '--'
        ),
    },
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.parentCompany)}>
          {transifex(columnHeaders.parentCompany)}
        </span>
      ),
      accessor: 'Parent Company',
      show: true,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    },
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.supplier)}>
          {transifex(columnHeaders.supplier)}
        </span>
      ),
      accessor: 'Supplier Name',
      show: true,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    },
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.supplierTwo)}>
          {transifex(columnHeaders.supplierTwo)}
        </span>
      ),
      accessor: 'Second Supplier Name',
      show: true,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    },
  ],
  commodity_analysis: [
    {
      Header: () => (
        <div className="react-table-commodity-risk">
          <span className="title-text" title={transifex(columnHeaders.threatsAndValues)}>
            {transifex(columnHeaders.threatsAndValuesAbbr)}{' '}
            <IconButtonWrapper id={locationsPage.infoBubbleConfig.threatsAndValues} />
          </span>
        </div>
      ),
      columns: [
        {
          id: 'commodity_mill_priority_level',
          Header: () => (
            <span className="title-text" title={transifex(columnHeaders.millPriority)}>
              {transifex(columnHeaders.millPriority)}
            </span>
          ),
          accessor: (d) => {
            return d;
          },
          className: 'default-cell',
          show: true,
          width: 90,
          maxWidth: 90,

          Cell: (row) =>
            row.value.location_status_id !== 2 ? (
              '--'
            ) : checkValid(row.value.commodity_mill_priority_level) ? (
              <div
                className={`list-analysis-text ${
                  getLastValue(row.value.commodity_mill_priority_level) === 0
                    ? 'list-analysis-text--yellow'
                    : getLastValue(row.value.commodity_mill_priority_level) === 1
                    ? 'list-analysis-text--orange'
                    : 'list-analysis-text--red'
                }`}
              >
                {getLastValue(row.value.commodity_mill_priority_level) === 0
                  ? transifex(columnHeaders.low)
                  : getLastValue(row.value.commodity_mill_priority_level) === 1
                  ? transifex(columnHeaders.mediumAbbr)
                  : transifex(columnHeaders.high)}
              </div>
            ) : (
              '--'
            ),
          sortMethod: (a, b) => {
            let returnValue = 0;
            if (a.location_status_id !== 2 && b.location_status_id === 2) {
              returnValue = -1;
            } else if (a.location_status_id !== 2 && b.location_status_id !== 2) {
              returnValue = 0;
            } else if (a.location_status_id === 2 && b.location_status_id !== 2) {
              returnValue = 1;
            } else if (a.location_status_id === 2 && b.location_status_id === 2) {
              returnValue =
                getLastValue(a.commodity_mill_priority_level) -
                getLastValue(b.commodity_mill_priority_level);
            } else {
              returnValue = 0;
            }

            return returnValue;
          },
        },
      ],
    },
    {
      Header: () => (
        <div className="react-table-commodity-risk">
          <span className="title-text" title={transifex(columnHeaders.threats)}>
            {transifex(columnHeaders.threats)}{' '}
            <IconButtonWrapper id={locationsPage.infoBubbleConfig.threats} />
          </span>
        </div>
      ),
      columns: [
        {
          id: 'commodity_threat_deforestation_level',
          Header: () => (
            <span className="title-text" title={transifex(columnHeaders.deforestation)}>
              {transifex(columnHeaders.deforestation)}
            </span>
          ),
          accessor: (d) => {
            return d;
          },
          className: 'default-cell',
          show: true,
          width: 75,
          maxWidth: 75,
          Cell: (row) =>
            row.value.location_status_id !== 2 ? (
              '--'
            ) : checkValid(row.value.commodity_threat_deforestation_level) ? (
              <div
                className={`list-icons-container ${
                  getLastValue(row.value.commodity_threat_deforestation_level) === 0
                    ? 'list-icons-container--yellow'
                    : getLastValue(row.value.commodity_threat_deforestation_level) === 1
                    ? 'list-icons-container--orange'
                    : 'list-icons-container--red'
                }`}
              >
                <svg className="list-icons">
                  <use className="analysis-header-click" xlinkHref="#circle-list" />
                </svg>
              </div>
            ) : (
              '--'
            ),
          sortMethod: (a, b) => {
            let returnValue = 0;
            if (a.location_status_id !== 2 && b.location_status_id === 2) {
              returnValue = -1;
            } else if (a.location_status_id !== 2 && b.location_status_id !== 2) {
              returnValue = 0;
            } else if (a.location_status_id === 2 && b.location_status_id !== 2) {
              returnValue = 1;
            } else if (a.location_status_id === 2 && b.location_status_id === 2) {
              returnValue =
                getLastValue(a.commodity_threat_deforestation_level) -
                getLastValue(b.commodity_threat_deforestation_level);
            } else {
              returnValue = 0;
            }

            return returnValue;
          },
        },
        {
          id: 'commodity_threat_peat_level',
          Header: () => (
            <span className="title-text" title={transifex(columnHeaders.peat)}>
              {transifex(columnHeaders.peat)}
            </span>
          ),
          accessor: (d) => {
            return d;
          },
          className: 'default-cell',
          show: true,
          width: 75,
          maxWidth: 75,
          Cell: (row) =>
            row.value.location_status_id !== 2 ? (
              '--'
            ) : checkValid(row.value.commodity_threat_peat_level) ? (
              <div
                className={`list-icons-container ${
                  getLastValue(row.value.commodity_threat_peat_level) === 0
                    ? 'list-icons-container--yellow'
                    : getLastValue(row.value.commodity_threat_peat_level) === 1
                    ? 'list-icons-container--orange'
                    : 'list-icons-container--red'
                }`}
              >
                <svg className="list-icons">
                  <use className="analysis-header-click" xlinkHref="#circle-list" />
                </svg>
              </div>
            ) : (
              '--'
            ),
          sortMethod: (a, b) => {
            let returnValue = 0;
            if (a.location_status_id !== 2 && b.location_status_id === 2) {
              returnValue = -1;
            } else if (a.location_status_id !== 2 && b.location_status_id !== 2) {
              returnValue = 0;
            } else if (a.location_status_id === 2 && b.location_status_id !== 2) {
              returnValue = 1;
            } else if (a.location_status_id === 2 && b.location_status_id === 2) {
              returnValue =
                getLastValue(a.commodity_threat_peat_level) -
                getLastValue(b.commodity_threat_peat_level);
            } else {
              returnValue = 0;
            }

            return returnValue;
          },
        },
        {
          id: 'commodity_threat_protected_areas_level',
          Header: () => (
            <span className="title-text" title={transifex(columnHeaders.protectedAreas)}>
              {transifex(columnHeaders.protectedAreas)}
            </span>
          ),
          accessor: (d) => {
            return d;
          },
          className: 'default-cell',
          show: true,
          width: 75,
          maxWidth: 75,
          Cell: (row) =>
            row.value.location_status_id !== 2 ? (
              '--'
            ) : checkValid(row.value.commodity_threat_protected_areas_level) ? (
              <div
                className={`list-icons-container ${
                  getLastValue(row.value.commodity_threat_protected_areas_level) === 0
                    ? 'list-icons-container--yellow'
                    : getLastValue(row.value.commodity_threat_protected_areas_level) === 1
                    ? 'list-icons-container--orange'
                    : 'list-icons-container--red'
                }`}
              >
                <svg className="list-icons">
                  <use className="analysis-header-click" xlinkHref="#circle-list" />
                </svg>
              </div>
            ) : (
              '--'
            ),
          sortMethod: (a, b) => {
            let returnValue = 0;
            if (a.location_status_id !== 2 && b.location_status_id === 2) {
              returnValue = -1;
            } else if (a.location_status_id !== 2 && b.location_status_id !== 2) {
              returnValue = 0;
            } else if (a.location_status_id === 2 && b.location_status_id !== 2) {
              returnValue = 1;
            } else if (a.location_status_id === 2 && b.location_status_id === 2) {
              returnValue =
                getLastValue(a.commodity_threat_protected_areas_level) -
                getLastValue(b.commodity_threat_protected_areas_level);
            } else {
              returnValue = 0;
            }

            return returnValue;
          },
        },
        {
          id: 'commodity_threat_fires_level',
          Header: () => (
            <span className="title-text" title={transifex(columnHeaders.fire)}>
              {transifex(columnHeaders.fire)}
            </span>
          ),
          accessor: (d) => {
            return d;
          },
          className: 'default-cell',
          show: true,
          width: 60,
          maxWidth: 60,
          Cell: (row) =>
            row.value.location_status_id !== 2 ? (
              '--'
            ) : checkValid(row.value.commodity_threat_fires_level) ? (
              <div
                className={`list-icons-container ${
                  getLastValue(row.value.commodity_threat_fires_level) === 0
                    ? 'list-icons-container--yellow'
                    : getLastValue(row.value.commodity_threat_fires_level) === 1
                    ? 'list-icons-container--orange'
                    : 'list-icons-container--red'
                }`}
              >
                <svg className="list-icons">
                  <use className="analysis-header-click" xlinkHref="#circle-list" />
                </svg>
              </div>
            ) : (
              '--'
            ),
          sortMethod: (a, b) => {
            let returnValue = 0;
            if (a.location_status_id !== 2 && b.location_status_id === 2) {
              returnValue = -1;
            } else if (a.location_status_id !== 2 && b.location_status_id !== 2) {
              returnValue = 0;
            } else if (a.location_status_id === 2 && b.location_status_id !== 2) {
              returnValue = 1;
            } else if (a.location_status_id === 2 && b.location_status_id === 2) {
              returnValue =
                getLastValue(a.commodity_threat_fires_level) -
                getLastValue(b.commodity_threat_fires_level);
            } else {
              returnValue = 0;
            }

            return returnValue;
          },
        },
        {
          id: 'commodity_threat_overall_level',
          Header: () => (
            <span className="title-text" title={transifex(columnHeaders.overall)}>
              {transifex(columnHeaders.overall)}
            </span>
          ),
          accessor: (d) => {
            return d;
          },
          className: 'default-cell',
          show: true,
          width: 75,
          maxWidth: 75,
          Cell: (row) =>
            row.value.location_status_id !== 2 ? (
              '--'
            ) : checkValid(row.value.commodity_threat_overall_level) ? (
              <div
                className={`list-analysis-text ${
                  getLastValue(row.value.commodity_threat_overall_level) === 0
                    ? 'list-analysis-text--yellow'
                    : getLastValue(row.value.commodity_threat_overall_level) === 1
                    ? 'list-analysis-text--orange'
                    : 'list-analysis-text--red'
                }`}
              >
                {getLastValue(row.value.commodity_threat_overall_level) === 0
                  ? transifex(columnHeaders.low)
                  : getLastValue(row.value.commodity_threat_overall_level) === 1
                  ? transifex(columnHeaders.mediumAbbr)
                  : transifex(columnHeaders.high)}
              </div>
            ) : (
              '--'
            ),
          sortMethod: (a, b) => {
            let returnValue = 0;
            if (a.location_status_id !== 2 && b.location_status_id === 2) {
              returnValue = -1;
            } else if (a.location_status_id !== 2 && b.location_status_id !== 2) {
              returnValue = 0;
            } else if (a.location_status_id === 2 && b.location_status_id !== 2) {
              returnValue = 1;
            } else if (a.location_status_id === 2 && b.location_status_id === 2) {
              returnValue =
                Object.values(JSON.parse(a.commodity_threat_overall_level)).reduce(
                  (aa, bb) => aa + bb,
                  0
                ) -
                Object.values(JSON.parse(b.commodity_threat_overall_level)).reduce(
                  (aa, bb) => aa + bb,
                  0
                );
            } else {
              returnValue = 0;
            }

            return returnValue;
          },
        },
      ],
    },
    {
      Header: () => (
        <div className="react-table-commodity-risk">
          <span className="title-text" title={transifex(columnHeaders.values)}>
            {transifex(columnHeaders.values)}{' '}
            <IconButtonWrapper id={locationsPage.infoBubbleConfig.values} />
          </span>
        </div>
      ),
      columns: [
        {
          id: 'commodity_value_forest_extent_level',
          Header: () => (
            <span className="title-text" title={transifex(columnHeaders.forest)}>
              {transifex(columnHeaders.forest)}
            </span>
          ),
          accessor: (d) => {
            return d;
          },
          className: 'default-cell',
          show: true,
          width: 75,
          maxWidth: 75,
          Cell: (row) =>
            row.value.location_status_id !== 2 ? (
              '--'
            ) : checkValid(row.value.commodity_value_forest_extent_level) ? (
              <div
                className={`list-icons-container ${
                  getLastValue(row.value.commodity_value_forest_extent_level) === 0
                    ? 'list-icons-container--yellow'
                    : getLastValue(row.value.commodity_value_forest_extent_level) === 1
                    ? 'list-icons-container--orange'
                    : 'list-icons-container--red'
                }`}
              >
                <svg className="list-icons">
                  <use className="analysis-header-click" xlinkHref="#circle-list" />
                </svg>
              </div>
            ) : (
              '--'
            ),
          sortMethod: (a, b) => {
            let returnValue = 0;
            if (a.location_status_id !== 2 && b.location_status_id === 2) {
              returnValue = -1;
            } else if (a.location_status_id !== 2 && b.location_status_id !== 2) {
              returnValue = 0;
            } else if (a.location_status_id === 2 && b.location_status_id !== 2) {
              returnValue = 1;
            } else if (a.location_status_id === 2 && b.location_status_id === 2) {
              returnValue =
                Object.values(JSON.parse(a.commodity_value_forest_extent_level)).reduce(
                  (aa, bb) => aa + bb,
                  0
                ) -
                Object.values(JSON.parse(b.commodity_value_forest_extent_level)).reduce(
                  (aa, bb) => aa + bb,
                  0
                );
            } else {
              returnValue = 0;
            }

            return returnValue;
          },
        },
        {
          id: 'commodity_value_peat_level',
          Header: () => (
            <span className="title-text" title={transifex(columnHeaders.peat)}>
              {transifex(columnHeaders.peat)}
            </span>
          ),
          accessor: (d) => {
            return d;
          },
          className: 'default-cell',
          show: true,
          width: 75,
          maxWidth: 75,
          Cell: (row) =>
            row.value.location_status_id !== 2 ? (
              '--'
            ) : checkValid(row.value.commodity_value_peat_level) ? (
              <div
                className={`list-icons-container ${
                  getLastValue(row.value.commodity_value_peat_level) === 0
                    ? 'list-icons-container--yellow'
                    : getLastValue(row.value.commodity_value_peat_level) === 1
                    ? 'list-icons-container--orange'
                    : 'list-icons-container--red'
                }`}
              >
                <svg className="list-icons">
                  <use className="analysis-header-click" xlinkHref="#circle-list" />
                </svg>
              </div>
            ) : (
              '--'
            ),
          sortMethod: (a, b) => {
            let returnValue = 0;
            if (a.location_status_id !== 2 && b.location_status_id === 2) {
              returnValue = -1;
            } else if (a.location_status_id !== 2 && b.location_status_id !== 2) {
              returnValue = 0;
            } else if (a.location_status_id === 2 && b.location_status_id !== 2) {
              returnValue = 1;
            } else if (a.location_status_id === 2 && b.location_status_id === 2) {
              returnValue =
                Object.values(JSON.parse(a.commodity_value_peat_level)).reduce(
                  (aa, bb) => aa + bb,
                  0
                ) -
                Object.values(JSON.parse(b.commodity_value_peat_level)).reduce(
                  (aa, bb) => aa + bb,
                  0
                );
            } else {
              returnValue = 0;
            }

            return returnValue;
          },
        },
        {
          id: 'commodity_value_protected_areas_level',
          Header: () => (
            <span className="title-text" title={transifex(columnHeaders.protectedAreas)}>
              {transifex(columnHeaders.protectedAreas)}
            </span>
          ),
          accessor: (d) => {
            return d;
          },
          className: 'default-cell',
          show: true,
          width: 75,
          maxWidth: 75,
          Cell: (row) =>
            row.value.location_status_id !== 2 ? (
              '--'
            ) : checkValid(row.value.commodity_value_protected_areas_level) ? (
              <div
                className={`list-icons-container ${
                  getLastValue(row.value.commodity_value_protected_areas_level) === 0
                    ? 'list-icons-container--yellow'
                    : getLastValue(row.value.commodity_value_protected_areas_level) === 1
                    ? 'list-icons-container--orange'
                    : 'list-icons-container--red'
                }`}
              >
                <svg className="list-icons">
                  <use className="analysis-header-click" xlinkHref="#circle-list" />
                </svg>
              </div>
            ) : (
              '--'
            ),
          sortMethod: (a, b) => {
            let returnValue = 0;
            if (a.location_status_id !== 2 && b.location_status_id === 2) {
              returnValue = -1;
            } else if (a.location_status_id !== 2 && b.location_status_id !== 2) {
              returnValue = 0;
            } else if (a.location_status_id === 2 && b.location_status_id !== 2) {
              returnValue = 1;
            } else if (a.location_status_id === 2 && b.location_status_id === 2) {
              returnValue =
                Object.values(JSON.parse(a.commodity_value_protected_areas_level)).reduce(
                  (aa, bb) => aa + bb,
                  0
                ) -
                Object.values(JSON.parse(b.commodity_value_protected_areas_level)).reduce(
                  (aa, bb) => aa + bb,
                  0
                );
            } else {
              returnValue = 0;
            }

            return returnValue;
          },
        },
        {
          id: 'commodity_value_overall_level',
          Header: () => (
            <span className="title-text" title={transifex(columnHeaders.overall)}>
              {transifex(columnHeaders.overall)}
            </span>
          ),
          accessor: (d) => {
            return d;
          },
          className: 'default-cell',
          show: true,
          width: 75,
          maxWidth: 75,
          Cell: (row) =>
            row.value.location_status_id !== 2 ? (
              '--'
            ) : checkValid(row.value.commodity_value_overall_level) ? (
              <div
                className={`list-analysis-text ${
                  getLastValue(row.value.commodity_value_overall_level) === 0
                    ? 'list-analysis-text--yellow'
                    : getLastValue(row.value.commodity_value_overall_level) === 1
                    ? 'list-analysis-text--orange'
                    : 'list-analysis-text--red'
                }`}
              >
                {getLastValue(row.value.commodity_value_overall_level) === 0
                  ? transifex(columnHeaders.low)
                  : getLastValue(row.value.commodity_value_overall_level) === 1
                  ? transifex(columnHeaders.mediumAbbr)
                  : transifex(columnHeaders.high)}
              </div>
            ) : (
              '--'
            ),
          sortMethod: (a, b) => {
            let returnValue = 0;
            if (a.location_status_id !== 2 && b.location_status_id === 2) {
              returnValue = -1;
            } else if (a.location_status_id !== 2 && b.location_status_id !== 2) {
              returnValue = 0;
            } else if (a.location_status_id === 2 && b.location_status_id !== 2) {
              returnValue = 1;
            } else if (a.location_status_id === 2 && b.location_status_id === 2) {
              returnValue =
                Object.values(JSON.parse(a.commodity_value_overall_level)).reduce(
                  (aa, bb) => aa + bb,
                  0
                ) -
                Object.values(JSON.parse(b.commodity_value_overall_level)).reduce(
                  (aa, bb) => aa + bb,
                  0
                );
            } else {
              returnValue = 0;
            }

            return returnValue;
          },
        },
      ],
    },
  ],
  palm_oil_mill_fc: [
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.parentCompany)}>
          {transifex(columnHeaders.parentCompany)}
        </span>
      ),
      accessor: 'Parent Company',
      show: true,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    },
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.certification)}>
          {transifex(columnHeaders.certification)}
        </span>
      ),
      accessor: 'Certification',
      show: true,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    },
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.rspoModel)}>
          {transifex(columnHeaders.rspoModel)}
        </span>
      ),
      accessor: 'RSPO Model',
      show: true,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    },
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.id)}>
          {transifex(columnHeaders.id)}
        </span>
      ),
      accessor: 'Mill ID',
      show: true,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    },
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.alternativeMill)}>
          {transifex(columnHeaders.alternativeMill)}
        </span>
      ),
      accessor: 'Alternative Name',
      show: true,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    },
  ],
  palm_oil_mill_cr: [
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.certification)}>
          {transifex(columnHeaders.certification)}
        </span>
      ),
      accessor: 'Certification',
      show: true,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    },
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.rspoModel)}>
          {transifex(columnHeaders.rspoModel)}
        </span>
      ),
      accessor: 'RSPO Model',
      show: true,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    },
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.id)}>
          {transifex(columnHeaders.id)}
        </span>
      ),
      accessor: 'Mill ID',
      show: true,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    },
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.alternativeMill)}>
          {transifex(columnHeaders.alternativeMill)}
        </span>
      ),
      accessor: 'Alternative Name',
      show: true,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    },
  ],
  oil_palm_concession_fc: [
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.company)}>
          {transifex(columnHeaders.company)}
        </span>
      ),
      accessor: 'Company',
      show: true,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    },
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.parentCompany)}>
          {transifex(columnHeaders.parentCompany)}
        </span>
      ),
      accessor: 'Parent Company',
      show: true,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    },
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.certification)}>
          {transifex(columnHeaders.certification)}
        </span>
      ),
      accessor: 'Certification',
      show: true,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    },
  ],
  protected_area_fc: [
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.iucn)}>
          {transifex(columnHeaders.iucn)}
        </span>
      ),
      accessor: 'IUCN CAT',
      show: true,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    },
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.designationType)}>
          {transifex(columnHeaders.designationType)}
        </span>
      ),
      accessor: 'Designation Type',
      show: true,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    },
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.designation)}>
          {transifex(columnHeaders.designation)}
        </span>
      ),
      accessor: 'Designation',
      width: 300,
      maxWidth: 300,
      show: true,
      Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    },
  ],
  location_id: [
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.siteId)}>
          {transifex(columnHeaders.siteId)}
        </span>
      ),
      accessor: 'location_id',
      className: 'cell__Site-ID default-cell td-num',
      show: false,
      width: 75,
      maxWidth: 75,
    },
  ],
  react_table__location_name: [
    {
      Header: () => (
        <span className="title-text" title={transifex(columnHeaders.locationName)}>
          {transifex(columnHeaders.locationName)}
        </span>
      ),
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
            ? 'This location has not been analyzed. The list owner will need to submit the list for analysis. Once submitted, this list will not be accessible until analysis is complete.'
            : 'This location has not been analyzed. To view location details and diagnostics for this list, please click the submit button at the top of the screen.';
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
                  tooltipMessage="This location has failed analysis. To receive results, resubmit this list for analysis."
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
  ],
  flags: [
    {
      name: 'General',
      field: 'flag_general',
    },
    {
      name: 'GLAD alerts',
      field: 'flag_glad',
    },
    {
      name: 'FORMA alerts',
      field: 'flag_forma',
    },
    {
      name: 'VIIRS active fires alerts',
      field: 'flag_viirs',
    },
  ],
};

export default columns;
