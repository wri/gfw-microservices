import { Typography, Box, Table } from '@mui/material';
import { accountProfileStrings } from '../../../../common/js/config';

function AccountsListsTable({
  accountSortingCategory,
  accountDir,
  accountsList,
  searchAccts,
  sortAcctTable,
}) {
  const getSortClass = (column) => {
    if (accountSortingCategory !== column) {
      return '';
    }
    return accountDir === 'asc' ? 'active-asc' : 'active-desc';
  };

  return (
    <Box>
      <section>
        <div className="flex-grid space-between align-center">
          <Typography sx={{ margin: '1rem 0' }} variant="h3">
            {accountProfileStrings.sectionTitles.accountProfiles}
          </Typography>
        </div>
        <input onChange={searchAccts} placeholder="Search for account" className="space-element" />
        <Box sx={scrollableBoxStyles}>
          <Table sx={{ minWidth: 1000, transform: 'rotateX(180deg)' }}>
            {/* flip content back */}
            <thead>
              <tr>
                <th
                  className="sortable-table-header"
                  title="organization_name"
                  onClick={(evt) => {
                    sortAcctTable(evt);
                  }}
                >
                  Organization Name
                  <div className={`sortable-carrot ${getSortClass('organization_name')}`} />
                </th>
                <th
                  className="sortable-table-header"
                  title="organization_parent"
                  onClick={(evt) => {
                    sortAcctTable(evt);
                  }}
                >
                  Parent Organization Name
                  <div className={`sortable-carrot ${getSortClass('organization_parent')}`} />
                </th>
                <th
                  className="sortable-table-header"
                  title="classString"
                  onClick={(evt) => {
                    sortAcctTable(evt);
                  }}
                >
                  Organization Classification(s)
                  <div className={`sortable-carrot ${getSortClass('classString')}`} />
                </th>
                <th
                  className="sortable-table-header"
                  title="statusString"
                  onClick={(evt) => {
                    sortAcctTable(evt);
                  }}
                >
                  Account Status
                  <div className={`sortable-carrot ${getSortClass('statusString')}`} />
                </th>
                <th
                  className="sortable-table-header"
                  title="requestedDateString"
                  onClick={(evt) => {
                    sortAcctTable(evt);
                  }}
                >
                  Date Requested
                  <div className={`sortable-carrot ${getSortClass('requestedDateString')}`} />
                </th>
                <th
                  className="sortable-table-header"
                  title="activeDateString"
                  onClick={(evt) => {
                    sortAcctTable(evt);
                  }}
                >
                  Date Activated
                  <div className={`sortable-carrot ${getSortClass('activeDateString')}`} />
                </th>
                <th
                  className="sortable-table-header"
                  title="organization_address"
                  onClick={(evt) => {
                    sortAcctTable(evt);
                  }}
                >
                  Organization Address
                  <div className={`sortable-carrot ${getSortClass('organization_address')}`} />
                </th>
                <th
                  className="sortable-table-header"
                  title="organization_website"
                  onClick={(evt) => {
                    sortAcctTable(evt);
                  }}
                >
                  Organization Website
                  <div className={`sortable-carrot ${getSortClass('organization_website')}`} />
                </th>
              </tr>
            </thead>
            <tbody>{accountsList}</tbody>
          </Table>
        </Box>
      </section>
    </Box>
  );
}

export default AccountsListsTable;

const scrollableBoxStyles = () => ({
  '&::before, &::after': {
    bottom: 0,
    content: '""',
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    width: 24,
  },
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
  marginLeft: '-1rem', // pull it back to align with viewport edges
  marginRight: '-1.5rem',
  marginTop: '1rem',
  maxWidth: 'calc(100vw + 2rem)',
  overflowX: 'auto',
  p: 1,
  position: 'relative',
  transform: 'rotateX(180deg)', // flips scrollbar to top
  width: 'calc(100% + 2rem)', // add extra scrollable width
});
