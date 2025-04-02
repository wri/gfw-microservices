import React from 'react';
import Popover from 'material-ui/Popover';
import IconShare from '../../../../../common/js/components/icon/IconShare';
import IconButton from '../../../../../common/js/components/IconButton';
import IconTimes from '../../../../../common/js/components/icon/IconTimes';
import { locationsPage } from '../../../../../common/js/config';
import { numberWithCommas } from '../../../../../locations/js/utils/locationsTableUtils';
import { getCommodityName } from '../../../../../utils/list-utils';
import './LocationsSummary.scss';

const transifex = Transifex.live.translateText;

function LocationsSummary({
  anchorElCountries,
  closeCountriesPopover,
  countries,
  filterValues,
  listLocationsCount,
  openCountriesPopover,
  selectedList,
  shareView,
  toggleCountriesPopover,
  numberOfResults,
}) {
  const isGfwProList = selectedList.isGlobalForestWatchList;

  const listLength = selectedList?.list_locations_count;
  let countriesSelected = [];

  const commodityName = getCommodityName(selectedList?.Commodity);

  // If the custom text exceeds 30 characters, truncate the text with an ellipsis ("...")
  const truncatedCommodityName =
    commodityName?.length > 30 ? commodityName.slice(0, 30) + '...' : commodityName;

  if (!isGfwProList) {
    countriesSelected =
      listLocationsCount < selectedList.list_locations_count
        ? countries
        : Object.keys(filterValues).filter((key) => key !== 'null');
  } else {
    countriesSelected = countries;
  }

  const countriesString = countriesSelected.join(', ');

  const countriesStringSummary =
    countriesSelected.length > 3 ? countriesSelected.slice(0, 3).join(', ') : countriesString;

  const showingText = Transifex.live.translateText('Showing');
  const ofText = Transifex.live.translateText('of');
  const numberOfFilteredLocations =
    numberOfResults && numberOfResults < selectedList.list_locations_count
      ? `${showingText} ${numberWithCommas(numberOfResults)} ${ofText}`
      : '';
  const totalLocationsText = Transifex.live.translateText('total locations • ');

  return (
    <header className="locations-summary">
      {shareView && (
        <span>
          <IconShare height="16px" />
          <span> {transifex(locationsPage.lists.share)}</span>
          <span className="bullet-divider">•</span>
        </span>
      )}
      {listLength > 0 && (
        <div
          onClick={(e) => {
            if (countriesSelected.length > 3) {
              toggleCountriesPopover(e);
            }
          }}
        >
          {truncatedCommodityName && <span>{truncatedCommodityName} •</span>}
          <span>{`${numberOfFilteredLocations} ${numberWithCommas(
            listLength
          )} ${totalLocationsText}`}</span>

          {countriesSelected.length <= 3 && countriesStringSummary}
          {countriesSelected.length > 3 && (
            <span className="country-name-extend">
              {countriesStringSummary}…
              <Popover
                className="countries-popover dialog"
                open={openCountriesPopover}
                anchorEl={anchorElCountries}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                onRequestClose={closeCountriesPopover}
              >
                <div className="countries-popover__inner">
                  <div className="countries-popover__header dialog__header">
                    <h3 className="countries-popover__title dialog__title">
                      {transifex(locationsPage.lists.titlePopoverCountries)}
                    </h3>
                    <IconButton
                      icon={<IconTimes />}
                      title={transifex(locationsPage.lists.closePopover)}
                      onClick={closeCountriesPopover}
                      size="medium"
                    />
                  </div>
                  <p className="countries-popover__list dialog__prompt">{countriesString}</p>
                  {commodityName && (
                    <p className="countries-popover__list dialog__prompt">{`
                      ${transifex(locationsPage.lists.commodityType)}: ${commodityName}`}</p>
                  )}
                </div>
              </Popover>
            </span>
          )}
        </div>
      )}
    </header>
  );
}

export default LocationsSummary;
