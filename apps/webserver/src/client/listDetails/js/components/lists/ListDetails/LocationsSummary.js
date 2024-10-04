import React from 'react';
import Popover from 'material-ui/Popover';
import IconShare from '../../../../../common/js/components/icon/IconShare';
import IconButton from '../../../../../common/js/components/IconButton';
import IconTimes from '../../../../../common/js/components/icon/IconTimes';
import { locationsPage } from '../../../../../common/js/config';
import { numberWithCommas } from '../../../../../locations/js/utils/locationsTableUtils';

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

  if (!isGfwProList) {
    countriesSelected =
      listLocationsCount < selectedList.list_locations_count
        ? countries
        : Object.keys(filterValues);
  } else {
    countriesSelected = countries;
  }
  let countriesString = countriesSelected.join(', ');
  countriesString = countriesString.replaceAll('null', '--');
  const countriesStringSummary =
    countriesSelected.length > 3
      ? countriesSelected.slice(0, 3).join(', ').replaceAll('null', '--')
      : countriesString;
  const numberOfFilteredLocations =
    numberOfResults < selectedList.list_locations_count ? `Showing ${numberOfResults} of` : '';

  return (
    <header className="list-detail-header__info-container">
      <div>
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
            <span>{`${numberOfFilteredLocations} ${numberWithCommas(
              listLength
            )} total locations • `}</span>

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
                      <h1 className="countries-popover__title dialog__title">
                        {transifex(locationsPage.lists.titlePopoverCountries)}
                      </h1>
                      <IconButton
                        icon={<IconTimes />}
                        title={transifex(locationsPage.lists.closePopover)}
                        onClick={closeCountriesPopover}
                        size="medium"
                      />
                    </div>
                    <p className="countries-popover__list dialog__prompt">{countriesString}</p>
                  </div>
                </Popover>
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default LocationsSummary;
