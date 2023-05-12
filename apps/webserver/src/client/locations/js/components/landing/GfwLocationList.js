import React from 'react';

import { numberWithCommas } from '../../utils/locationsTableUtils';
import IconArrowRight from '../../../../common/js/components/icon/IconArrowRight';

const GfwLocationList = ({ changeList, list }) => {
  return (
    <button className="locations-list-gfw" onClick={() => changeList(list)}>
      <div className="locations-list-gfw__inner">
        <h4 className="locations-list-gfw__title">{list.list_name}</h4>
        <div className="locations-list-gfw__count">
          <span className="locations-list-gfw__number">{numberWithCommas(list.list_locations_count)}</span>
          <span className="locations-list-gfw__label">locations</span>
        </div>
      </div>
      <div className="locations-list-gfw__arrow">
        <IconArrowRight className="locations-list-gfw__arrow-icon" />
      </div>
    </button>
  );
};

export default GfwLocationList;
