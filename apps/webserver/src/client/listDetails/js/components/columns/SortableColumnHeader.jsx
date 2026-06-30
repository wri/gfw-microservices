import { UnfoldMore } from '@mui/icons-material';

const transifex = (text) => window.Transifex?.live?.translateText?.(text) ?? text;

/**
 * Renders a column header label plus a lightweight dropdown trigger that opens the
 * shared sort menu (GPV-3912). The trigger is a plain button (not a per-header MUI
 * Menu) so a table with many columns stays cheap to re-render; the actual menu is a
 * single instance owned by WrappedReactTable.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The original header content (label).
 * @param {(event: React.MouseEvent) => void} props.onOpenMenu - Opens the shared sort menu.
 */
const SortableColumnHeader = ({ children, onOpenMenu }) => (
  <span className="sortable-column-header">
    <span className="sortable-column-header__label">{children}</span>
    <button
      type="button"
      className="sortable-column-header__trigger"
      aria-label={transifex('Open sort menu')}
      aria-haspopup="true"
      data-cy="column-sort-trigger"
      onClick={onOpenMenu}
    >
      <UnfoldMore fontSize="inherit" />
    </button>
  </span>
);

export default SortableColumnHeader;
