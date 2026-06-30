import { Menu, MenuItem, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { ArrowUpward, ArrowDownward, Check } from '@mui/icons-material';

const transifex = (text) => window.Transifex?.live?.translateText?.(text) ?? text;

/**
 * Single sort menu shared by every column header in a list table (GPV-3912).
 * Anchored to the captured click position (react-table remounts header cells on every
 * render, so a DOM-node anchor would detach).
 *
 * @param {Object} props
 * @param {{top: number, left: number}|null} props.position - Click position, or null when closed.
 * @param {Boolean} props.isSorted - Whether the anchored column is the sorted one.
 * @param {Boolean} props.isSortedDesc - Whether the current sort is descending.
 * @param {() => void} props.onClose - Close the menu.
 * @param {(desc: Boolean) => void} props.onSort - Apply a sort direction.
 */
const SortMenu = ({ position, isSorted, isSortedDesc, onClose, onSort }) => {
  const isAscendingActive = isSorted && !isSortedDesc;
  const isDescendingActive = isSorted && isSortedDesc;

  return (
    <Menu
      anchorReference="anchorPosition"
      anchorPosition={position ?? undefined}
      open={Boolean(position)}
      onClose={onClose}
      className="sortable-column-header__menu"
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <ListSubheader className="sortable-column-header__menu-title" disableSticky>
        {transifex('Sort by')}
      </ListSubheader>
      <MenuItem
        selected={isAscendingActive}
        data-cy="column-sort-ascending"
        onClick={() => onSort(false)}
      >
        <ListItemIcon>
          <ArrowUpward fontSize="small" />
        </ListItemIcon>
        <ListItemText>{transifex('Ascending')}</ListItemText>
        {isAscendingActive && <Check fontSize="small" className="sortable-column-header__check" />}
      </MenuItem>
      <MenuItem
        selected={isDescendingActive}
        data-cy="column-sort-descending"
        onClick={() => onSort(true)}
      >
        <ListItemIcon>
          <ArrowDownward fontSize="small" />
        </ListItemIcon>
        <ListItemText>{transifex('Descending')}</ListItemText>
        {isDescendingActive && <Check fontSize="small" className="sortable-column-header__check" />}
      </MenuItem>
    </Menu>
  );
};

export default SortMenu;
