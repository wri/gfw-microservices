import React from 'react';

function AccountsListsTable({
  accountSortingCategory,
  accountDir,
  accountsList,
  searchAccts,
  sortAcctTable,
}) {
  return (
    <div className="profile-body">
      <section>
        <div className="flex-grid space-between align-center">
          <h2 className="section-title-normal">Account Profiles</h2>
        </div>
        <input onChange={searchAccts} placeholder="Search for account" className="space-element" />
        <table>
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
              <th
                className="sortable-table-header"
                title="classString"
                onClick={(evt) => {
                  sortAcctTable(evt);
                }}
              >
                Organization Classifications
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
            </tr>
          </thead>
          <tbody>{accountsList}</tbody>
        </table>
      </section>
    </div>
  );
}

export default AccountsListsTable;
