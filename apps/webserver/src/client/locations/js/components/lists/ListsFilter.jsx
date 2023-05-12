import React from 'react';

import { locationsPage } from '../../../../common/js/config';
import IconSearch from '../../../../common/js/components/icon/IconSearch';
import IconTimes from '../../../../common/js/components/icon/IconTimes';
import IconButton from '../../../../common/js/components/IconButton';

/** Semi-generic search component that presents a text input used to filter items in a list
 *
 * @param className: CSS class name to attach to the container div of the component
 * @param placeholder: The placeholder text displayed in the inpiut box
 * @param value: The value displayed in the input box
 * @param onChange: Callback triggered when value in input box changes
 *
 */
function ListsFilter({ className, placeholder, value, onChange, onkeydown }) {
  const wrapperClass = className || 'input-search';
  return (
    <div className={wrapperClass}>
      <IconSearch className="input-search__icon" />
      <input
        type="search"
        className="input-search__input"
        placeholder={placeholder}
        aria-label={locationsPage.lists.listsFilterPlaceholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onkeydown}
      />
      <div className="input-search__clear">
        <IconButton
          aria-label={locationsPage.lists.listsFilterClear}
          icon={<IconTimes />}
          size="small"
          onClick={() => onChange('')}
        />
      </div>
    </div>
  );
}

export default ListsFilter;
