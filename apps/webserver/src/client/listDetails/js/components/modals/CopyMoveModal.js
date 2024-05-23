import React, { createRef, useEffect, useState } from 'react';
import debounce from 'lodash/debounce';

import GfwSelect from '../../../../common/js/components/GfwSelect';
import { locationsPage } from '../../../../common/js/config';
import SaveAsDraftNote from '../../../../common/js/components/SaveAsDraft/SaveAsDraftNote';

import { buildDropdownOptions } from '../../../../common/js/utils/buildDropdownOptions';

import './CopyMoveModal.scss';

const ActionType = {
  Move: 'move',
  Copy: 'copy',
};

const ListType = {
  New: 'new',
  Existing: 'existing',
};

export default function CopyMoveModal(props) {
  const {
    isGfwList,
    selectedMoveOrCopy,
    selectedNewOrExisting,
    newListName,
    isNewListNameDuplicate,
    selectedLists,
    locationsCount,
    setMoveOrCopy,
    setNewOrExisting,
    updateNewListName,
    updateSelectedMove,
    validLists,
  } = props;

  const listName = selectedLists[0].list_name;
  const dropdownOptions = buildDropdownOptions(validLists, 'list_name').dropdownOptions.filter(
    (v) => v.value !== listName
  );

  const [selectedExistingList, setSelectedExistingList] = useState();
  const newListNameRef = createRef();

  useEffect(() => {
    if (dropdownOptions.length > 0) {
      updateSelectedMove(dropdownOptions[0]);
      setSelectedExistingList(dropdownOptions[0]);
    } else {
      // If there are no compatible existing lists, auto-select "Create New"
      setNewOrExisting({ target: { value: 'new' } });
    }
  }, []);

  return (
    <div className="CopyMoveModal">
      <div className="move-or-copy__selector flex-grid">
        {!isGfwList && dropdownOptions.length > 0 && (
          <div
            className={
              selectedMoveOrCopy === ActionType.Move
                ? 'move-or-copy__selection move-or-copy__selection--selected'
                : 'move-or-copy__selection'
            }
          >
            <input
              type="radio"
              id="move-selection"
              name="move-or-copy"
              value="move"
              checked={selectedMoveOrCopy === ActionType.Move}
              onChange={(e) => {
                setMoveOrCopy(e);
                updateSelectedMove(selectedExistingList);
              }}
            />
            <label className="filter-label" htmlFor="move-selection">
              {locationsPage.lists.move}
            </label>
          </div>
        )}
        <div
          className={
            selectedMoveOrCopy === ActionType.Copy
              ? 'move-or-copy__selection move-or-copy__selection--selected'
              : 'move-or-copy__selection'
          }
        >
          <input
            type="radio"
            id="copy-selection"
            name="move-or-copy"
            value="copy"
            checked={selectedMoveOrCopy === ActionType.Copy}
            onChange={setMoveOrCopy}
          />
          <label className="filter-label" htmlFor="copy-selection">
            {locationsPage.lists.copy}
          </label>
        </div>
      </div>

      {selectedMoveOrCopy === ActionType.Move && (
        <p className="dialog__prompt">
          Remove{' '}
          <strong>
            {locationsCount} selected location{locationsCount !== 1 ? 's' : ''}
          </strong>{' '}
          from {listName} and add to a different list. If all locations are removed, the list will
          be deleted.
        </p>
      )}

      {selectedMoveOrCopy === ActionType.Copy && (
        <p className="dialog__prompt">
          Copy{' '}
          <strong>
            {locationsCount} selected location{locationsCount !== 1 ? 's' : ''}
          </strong>{' '}
          from {listName} to a different list.
        </p>
      )}

      <div>
        {dropdownOptions.length > 0 && (
          <>
            <div className="move-or-copy__option">
              <input
                type="radio"
                id="existing-selection"
                name="existing-or-new"
                value="existing"
                checked={selectedNewOrExisting === ListType.Existing}
                onChange={setNewOrExisting}
              />
              <label className="filter-label" htmlFor="existing-selection">
                {locationsPage.lists.existing}
              </label>
            </div>

            {selectedNewOrExisting === ListType.Existing && (
              <div className="move-or-copy__suboption">
                <span className="move-or-copy__hint">
                  {locationsPage.lists.moveExistingDescription}
                </span>
                <div className="move-to-list-select">
                  <GfwSelect
                    options={dropdownOptions}
                    value={selectedExistingList}
                    onChange={(e) => {
                      updateSelectedMove(e);
                      setSelectedExistingList(e);
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {selectedMoveOrCopy === ActionType.Copy && (
          <div className="move-or-copy__option">
            <input
              type="radio"
              id="new-selection"
              name="existing-or-new"
              value="new"
              checked={selectedNewOrExisting === ListType.New}
              onChange={setNewOrExisting}
            />
            <label className="filter-label" htmlFor="new-selection">
              {locationsPage.lists.new}
            </label>
          </div>
        )}

        {selectedNewOrExisting === ListType.New && (
          <div className="move-or-copy__suboption">
            <label className="filter-label block-label" htmlFor="new-list-name">
              {locationsPage.lists.moveToNewListLabel}
            </label>
            <input
              id="new-list-name"
              ref={newListNameRef}
              defaultValue={newListName}
              onChange={debounce((e) => {
                updateNewListName(newListNameRef.current.value);
              }, 100)}
            />
            {isNewListNameDuplicate && <div>{locationsPage.lists.moveToNewListDuplicate}</div>}
          </div>
        )}
      </div>

      <div className="CopyMoveModalFooter">
        <SaveAsDraftNote />
      </div>
    </div>
  );
}
