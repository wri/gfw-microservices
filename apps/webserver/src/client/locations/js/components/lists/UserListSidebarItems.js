import React from 'react';
import CustomTooltip from '../../../../common/js/components/CustomTooltip/CustomTooltip';
import FailedTooltip from '../../../../common/js/components/CustomTooltip/FailedTooltip';
import LinkButton from '../../../../common/js/components/LinkButton';
import InlineLoader from '../../../../common/js/components/Loaders/InlineLoader';
import { locationsPage, userAccessLevel, draftTooltipMessages } from '../../../../common/js/config';
import { numberWithCommas } from '../../utils/locationsTableUtils';

const listDetailTooltipId = 'list-detail-tooltip';

export const UserListSidebarItemActive = ({ isSelected, listName, locationCount, onClick }) => {
  return (
    <div
      className={`my-lists-summary__list-item ${
        isSelected ? 'my-lists-summary__list-item--selected' : ''
      }`}
      title={listName}
    >
      <LinkButton className="my-lists-summary__list-name" onClick={onClick} label={listName} />
      <span className="my-lists-summary__list-count">{numberWithCommas(locationCount)}</span>
    </div>
  );
};

export const UserListSidebarItemAnalyzing = ({ isSelected, listName }) => {
  return (
    <div
      className={`my-lists-summary__list-item ${
        isSelected ? 'list-selected' : ''
      } my-lists-summary__list-item--inactive`}
      data-for={listDetailTooltipId}
      data-place="right"
      title={locationsPage.lists.tooltips.analyzing}
    >
      <span className="my-lists-summary__list-name">{listName}</span>
      <span className="my-lists-summary__icon-container">
        <InlineLoader />
      </span>
    </div>
  );
};

export const UserListSidebarItemFailed = ({ isSelected, listName }) => {
  return (
    <div
      className={`my-lists-summary__list-item ${
        isSelected ? 'list-selected' : ''
      } my-lists-summary__list-item--failed`}
      data-for={listDetailTooltipId}
      data-place="right"
      data-tip={locationsPage.lists.tooltips.failed}
    >
      <span className="my-lists-summary__list-name">{listName}</span>
      <span className="my-lists-summary__icon-container">
        <FailedTooltip
          placement={'top'}
          label={''}
          tooltipMessage={
            'This list has failed analysis. To receive results, resubmit this list for analysis.'
          }
        />
      </span>
    </div>
  );
};

export const UserListSidebarItemDraft = ({
  isSelected,
  listName,
  onClick,
  selectedList,
  currentUser,
}) => {
  const userIsAdmin = currentUser.access_level_id === userAccessLevel.ADMIN;
  const userIsOwner = currentUser.id === selectedList.user_id;
  const draftTooltipMSG =
    !userIsAdmin && !userIsOwner ? draftTooltipMessages.nonOwner : draftTooltipMessages.owner;
  const TOOLTIP__LABEL = '';
  const TOOLTIP__MESSAGE = draftTooltipMSG;

  return (
    <div
      className={`my-lists-summary__list-item ${
        isSelected ? 'list-selected' : ''
      } my-lists-summary__list-item--failed`}
      data-for={listDetailTooltipId}
      data-place="right"
      data-tip={locationsPage.lists.tooltips.failed}
    >
      <LinkButton className="my-lists-summary__list-name" onClick={onClick} label={listName} />
      <span className="my-lists-summary__icon-container">
        <CustomTooltip placement={'top'} label={TOOLTIP__LABEL} tooltipMessage={TOOLTIP__MESSAGE} />
      </span>
    </div>
  );
};
