import { Popover } from '@mui/material';
import IconShare from '../../../../../common/js/components/icon/IconShare';
import IconButton from '../../../../../common/js/components/IconButton';
import IconTimes from '../../../../../common/js/components/icon/IconTimes';
import { locationsPage } from '../../../../../common/js/config';
import { numberWithCommas } from '../../../../../locations/js/utils/locationsTableUtils';
import { getCommodityName } from '../../../../../utils/list-utils';
import { useTransifexTranslation } from '../../../../../hooks';
import './LocationsSummary.scss';

const transifex = Transifex.live.translateText;

const MAX_VISIBLE_COUNTRIES = 3;

function LocationsSummary({
  anchorElCountries,
  countries,
  filterValues,
  listLocationsCount,
  selectedList,
  shareView,
  isOpen,
  onOpen,
  onClose,
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
    countriesSelected.length > MAX_VISIBLE_COUNTRIES
      ? countriesSelected.slice(0, MAX_VISIBLE_COUNTRIES).join(', ')
      : countriesString;

  const showingText = useTransifexTranslation('Showing');
  const ofText = useTransifexTranslation('of');
  const numberOfFilteredLocations =
    numberOfResults && numberOfResults < selectedList.list_locations_count ? (
      <>
        <span>{showingText}</span>
        <span>{` ${numberWithCommas(numberOfResults)} `}</span>
        <span>{ofText}</span>
      </>
    ) : (
      <></>
    );
  const totalLocationsText = useTransifexTranslation('total locations');
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
            if (countriesSelected.length > MAX_VISIBLE_COUNTRIES) {
              onOpen(e);
            }
          }}
        >
          {truncatedCommodityName && <span>{truncatedCommodityName} •</span>}
          <span>{numberOfFilteredLocations}</span>
          <span>{` ${numberWithCommas(listLength)} `}</span>
          <span>{totalLocationsText}</span>
          <span>{` • `}</span>

          {countriesSelected.length <= MAX_VISIBLE_COUNTRIES ? (
            countriesStringSummary
          ) : (
            <span className="country-name-extend">
              {countriesStringSummary}…
              <Popover
                className="countries-popover dialog"
                open={isOpen}
                anchorEl={anchorElCountries}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                onClose={onClose}
                slotProps={{ paper: { sx: { width: '350px' } } }}
              >
                <div className="countries-popover__inner">
                  <div className="countries-popover__header dialog__header">
                    <h3 className="countries-popover__title dialog__title">
                      {transifex(locationsPage.lists.titlePopoverCountries)}
                    </h3>
                    <IconButton
                      icon={<IconTimes />}
                      title={transifex(locationsPage.lists.closePopover)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
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
