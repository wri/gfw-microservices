/* eslint-disable no-undef */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import Popover from 'material-ui/Popover';
import { filter } from 'lodash';
import IconUsers from '../../../../common/js/components/icon/IconUsers';
import CustomTooltip from '../../../../common/js/components/CustomTooltip/CustomTooltip';
import IconShare from '../../../../common/js/components/icon/IconShare';
import IconButton from '../../../../common/js/components/IconButton';
import IconTimes from '../../../../common/js/components/icon/IconTimes';
import { locationsPage, userAccessLevel, draftTooltipMessages } from '../../../../common/js/config';
import { numberWithCommas } from '../../utils/locationsTableUtils';
import { getIsDiagnosticStatusDraft } from '../../utils/draft.utils';

const transifex = Transifex.live.translateText;

function ListTitle({
  anchorElCountries,
  closeCountriesPopover,
  countries,
  currentUser,
  filteredLists,
  filterValues,
  listLocationsCount,
  listName,
  openCountriesPopover,
  selectedList,
  shareView,
  showShareList,
  toggleCountriesPopover,
}) {
  const userIsAdmin = currentUser.access_level_id === userAccessLevel.ADMIN;
  const userIsOwner = currentUser.id === selectedList.user_id;
  const draftTooltipMSG =
    !userIsAdmin && !userIsOwner ? draftTooltipMessages.nonOwner : draftTooltipMessages.owner;

  const TOOLTIP__MESSAGE = draftTooltipMSG;

  const isGfwProList = [
    'Oil Palm Concessions',
    'RSPO Palm Concessions',
    'Palm Oil Mills',
    'Administrative Areas',
    'Protected Areas',
  ].includes(listName);

  let listLength = 0;
  let countriesSelected = [];

  if (!isGfwProList) {
    listLength = listLocationsCount ?? selectedList.list_locations_count;
    countriesSelected =
      listLocationsCount < selectedList.list_locations_count
        ? countries
        : Object.keys(filterValues);
  } else {
    listLength = filteredLists.length;
    countriesSelected = countries;
  }
  let countriesString = countriesSelected.join(', ');
  countriesString = countriesString.replaceAll('null', '--');
  const countriesStringSummary =
    countriesSelected.length > 3
      ? countriesSelected.slice(0, 3).join(', ').replaceAll('null', '--')
      : countriesString;

  return (
    <header className="list-detail-header__info-container notranslate">
      <h1
        className={`${
          shareView ? 'underline pointer back-arrows list-title' : 'list-detail-header__title'
        }`}
        onClick={() => {
          if (shareView) {
            showShareList(false);
          }
        }}
      >
        {shareView && (
          <>
            <IconUsers className="locations-list__shared-icon" />{' '}
          </>
        )}
        {listName}
        {getIsDiagnosticStatusDraft(selectedList) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {' '}
            <CustomTooltip
              iconWidth={20}
              iconHeight={26}
              placement="top"
              label="DRAFT"
              tooltipMessage={TOOLTIP__MESSAGE}
            />
          </div>
        )}
      </h1>

      <div className="list-detail-header__metadata">
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
            {numberWithCommas(listLength)}
            {listLength === 1
              ? transifex(locationsPage.lists.titleLocation)
              : transifex(locationsPage.lists.titleLocations)}{' '}
            <span className="bullet-divider">•</span>{' '}
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

export default ListTitle;
