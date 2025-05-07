import React from 'react';

import { numberWithCommas } from '../../utils/locationsTableUtils';
import { locationsPage } from '../../../../common/js/config';

const SummaryRow = ({ label, value }) => {
  const intValue = Number.parseInt(value, 10);
  const localeValue = Number.isNaN(intValue) ? 0 : numberWithCommas(intValue);
  return (
    <tr className="saved-locations-summary__row">
      <th scope="row" className="saved-locations-summary__key">
        {label}
      </th>
      <td className="saved-locations-summary__value">{localeValue}</td>
    </tr>
  );
};

/**
 *
 * @param {counts} An array of objects of the form:
 * {
 *    label: string,
 *    count: number
 * }
 */
const SavedLocationsSummary = ({ counts }) => {
  return (
    <div className="saved-locations-summary">
      <h3 className="saved-locations-summary__title">
        {locationsPage.lists.savedLocationsSummary}
      </h3>
      <table className="saved-locations-summary__inner">
        <tbody>
          {counts.map((c, i) => {
            return <SummaryRow key={i} label={c.label} value={c.count} />;
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SavedLocationsSummary;
