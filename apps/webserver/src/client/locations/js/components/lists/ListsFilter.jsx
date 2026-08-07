import { useTransifexTranslation } from '../../../../hooks/useTransifexTranslation';
import { locationsPage } from '../../../../common/js/config';
import IconSearch from '../../../../common/js/components/icon/IconSearch';
import IconTimes from '../../../../common/js/components/icon/IconTimes';
import IconButton from '../../../../common/js/components/IconButton';

/** Semi-generic search component that presents a text input used to filter items in a list
 *
 * @param className: CSS class name to attach to the container div of the component
 * @param value: The value displayed in the input box
 * @param onChange: Callback triggered when value in input box changes
 *
 */
function ListsFilter({ className, value, onChange, onkeydown }) {
  const wrapperClass = className || 'input-search';
  const placeholder = useTransifexTranslation(locationsPage.lists.searchStringInputPlaceholder);
  const filterLabel = useTransifexTranslation(locationsPage.lists.listsFilterPlaceholder);
  const clearLabel = useTransifexTranslation(locationsPage.lists.listsFilterClear);

  return (
    <div className={wrapperClass}>
      <IconSearch className="input-search__icon" />
      <input
        type="text"
        className="input-search__input"
        placeholder={placeholder}
        aria-label={filterLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onkeydown}
      />
      <div className="input-search__clear">
        <IconButton
          aria-label={clearLabel}
          icon={<IconTimes />}
          size="small"
          onClick={() => onChange('')}
        />
      </div>
    </div>
  );
}

export default ListsFilter;
