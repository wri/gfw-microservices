import { numberWithCommas } from '../../utils/locationsTableUtils';
import IconArrowRight from '../../../../common/js/components/icon/IconArrowRight';
import { DATA_CY } from '../../../../utils/constants';

const globalListIdToDataCyTag = {
  1: DATA_CY.LANDING.ADMINISTRATIVE_AREA,
  2: DATA_CY.LANDING.OIL_PALM_CONCESSIONS,
  3: DATA_CY.LANDING.PALM_OIL_MILLS,
  4: DATA_CY.LANDING.PROTECTED_AREAS,
  5: DATA_CY.LANDING.RSPO_PALM_CONCESSIONS,
};

const GfwLocationList = ({ changeList, list }) => {
  return (
    <button
      className="locations-list-gfw"
      onClick={() => changeList(list)}
      data-cy={globalListIdToDataCyTag[list.id]}
    >
      <div className="locations-list-gfw__inner">
        <h4 className="locations-list-gfw__title">{list.list_name}</h4>
        <div className="locations-list-gfw__count">
          <span className="locations-list-gfw__number">
            {numberWithCommas(list.list_locations_count)}
          </span>
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
