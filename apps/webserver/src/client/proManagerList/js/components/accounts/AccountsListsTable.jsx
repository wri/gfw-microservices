import { Typography, Box, Table } from '@mui/material';
import { accountProfileStrings } from '../../../../common/js/config';

function AccountsListsTable({
  accountSortingCategory,
  accountDir,
  accountsList,
  searchAccts,
  sortAcctTable,
}) {
  return (
    <Box>
      <section>
        <div className="flex-grid space-between align-center">
          <Typography sx={{ margin: '1rem 0' }} variant="h3">
            {accountProfileStrings.sectionTitles.accountProfiles}
          </Typography>
        </div>
        <input onChange={searchAccts} placeholder="Search for account" className="space-element" />
        <Box
          sx={scrollableBoxStyles}
        >
          <Table sx={{ minWidth: 1000, transform: 'rotateX(180deg)'}}> 
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
                  <div
                    className={`sortable-carrot ${
                      accountSortingCategory === 'organization_name' && accountDir === 'asc'
                        ? 'active-asc'
                        : accountSortingCategory === 'organization_name' && accountDir === 'des'
                        ? 'active-des'
                        : ''
                    }`}
                  />
                </th>
                <th
                  className="sortable-table-header"
                  title="organization_parent"
                  onClick={(evt) => {
                    sortAcctTable(evt);
                  }}
                >
                  Parent Organization Name
                  <div
                    className={`sortable-carrot ${
                      accountSortingCategory === 'organization_parent' && accountDir === 'asc'
                        ? 'active-asc'
                        : accountSortingCategory === 'organization_parent' && accountDir === 'des'
                        ? 'active-des'
                        : ''
                    }`}
                  />
                </th>
                <th
                  className="sortable-table-header"
                  title="classString"
                  onClick={(evt) => {
                    sortAcctTable(evt);
                  }}
                >
                  Organization Classification(s)
                  <div
                    className={`sortable-carrot ${
                      accountSortingCategory === 'classString' && accountDir === 'asc'
                        ? 'active-asc'
                        : accountSortingCategory === 'classString' && accountDir === 'des'
                        ? 'active-des'
                        : ''
                    }`}
                  />
                </th>
                <th
                  className="sortable-table-header"
                  title="statusString"
                  onClick={(evt) => {
                    sortAcctTable(evt);
                  }}
                >
                  Account Status
                  <div
                    className={`sortable-carrot ${
                      accountSortingCategory === 'statusString' && accountDir === 'asc'
                        ? 'active-asc'
                        : accountSortingCategory === 'statusString' && accountDir === 'des'
                        ? 'active-des'
                        : ''
                    }`}
                  />
                </th>
                <th
                  className="sortable-table-header"
                  title="pendingDateString"
                  onClick={(evt) => {
                    sortAcctTable(evt);
                  }}
                >
                  Date Requested
                  <div
                    className={`sortable-carrot ${
                      accountSortingCategory === 'pendingDateString' && accountDir === 'asc'
                        ? 'active-asc'
                        : accountSortingCategory === 'pendingDateString' && accountDir === 'des'
                        ? 'active-des'
                        : ''
                    }`}
                  />
                </th>
                <th
                  className="sortable-table-header"
                  title="activeDateString"
                  onClick={(evt) => {
                    sortAcctTable(evt);
                  }}
                >
                  Date Activated
                  <div
                    className={`sortable-carrot ${
                      accountSortingCategory === 'activeDateString' && accountDir === 'asc'
                        ? 'active-asc'
                        : accountSortingCategory === 'activeDateString' && accountDir === 'desc'
                        ? 'active-des'
                        : ''
                    }`}
                  />
                </th>
                <th
                  className="sortable-table-header"
                  title="organization_address"
                  onClick={(evt) => {
                    sortAcctTable(evt);
                  }}
                >
                  Organization Address
                  <div
                    className={`sortable-carrot ${
                      accountSortingCategory === 'organization_address' && accountDir === 'asc'
                        ? 'active-asc'
                        : accountSortingCategory === 'organization_address' && accountDir === 'des'
                        ? 'active-des'
                        : ''
                    }`}
                  />
                </th>
                <th
                  className="sortable-table-header"
                  title="organization_website"
                  onClick={(evt) => {
                    sortAcctTable(evt);
                  }}
                >
                  Organization Website
                  <div
                    className={`sortable-carrot ${
                      accountSortingCategory === 'organization_website' && accountDir === 'asc'
                        ? 'active-asc'
                        : accountSortingCategory === 'organization_website' && accountDir === 'des'
                        ? 'active-des'
                        : ''
                    }`}
                  />
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

const scrollableBoxStyles = theme => ({
  position: 'relative',
  width: 'calc(100% + 2rem)', // add extra scrollable width
  maxWidth: 'calc(100vw + 2rem)',
  marginLeft: '-1rem', // pull it back to align with viewport edges
  marginRight: '-1.5rem',
  marginTop: '1rem',
  overflowX: 'auto',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
  bgcolor: 'background.paper',
  p: 1,
  transform: 'rotateX(180deg)', // flips scrollbar to top
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 24,
    pointerEvents: 'none',
  },
});