import React from 'react';
import GfwButton from '../../../../common/js/components/GfwButton';

function ListOfUsersAndAccounts({
  accountSortingCategory,
  accountDir,
  accountsList,
  userSortingCategory,
  userDir,
  usersList,
  sortUserTable,
  toggleListMenu,
  searchAccts,
  sortAcctTable,
  searchUsers,
}) {
  return (
    <div className="profile-body">
      <section>
        <div className="flex-grid space-between align-center">
          <h2 className="section-title-normal">Account Profiles</h2>
          <div>
            <GfwButton classNames="btn-green" onClick={toggleListMenu} value="Update GFW Lists" />
          </div>
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
      <section className="section-container">
        <h2 className="section-title-normal">User Profiles</h2>
        <input className="space-element" onChange={searchUsers} placeholder="Search for user" />
        <table>
          <thead>
            <tr>
              <th
                className="sortable-table-header"
                title="first_name"
                onClick={(evt) => {
                  sortUserTable(evt);
                }}
              >
                User Name
                <div
                  className={`sortable-carrot ${
                    userSortingCategory === 'first_name' && userDir === 'asc'
                      ? 'active-asc'
                      : userSortingCategory === 'first_name' && userDir === 'des'
                      ? 'active-des'
                      : ''
                  }`}
                />
              </th>
              <th
                className="sortable-table-header"
                title="organization_name"
                onClick={(evt) => {
                  sortUserTable(evt);
                }}
              >
                Organization Name
                <div
                  className={`sortable-carrot ${
                    userSortingCategory === 'organization_name' && userDir === 'asc'
                      ? 'active-asc'
                      : userSortingCategory === 'organization_name' && userDir === 'des'
                      ? 'active-des'
                      : ''
                  }`}
                />
              </th>
              <th
                className="sortable-table-header"
                title="organization_classifications"
                onClick={(evt) => {
                  sortUserTable(evt);
                }}
              >
                Organization Classifications
                <div
                  className={`sortable-carrot ${
                    userSortingCategory === 'organization_classifications' && userDir === 'asc'
                      ? 'active-asc'
                      : userSortingCategory === 'organization_classifications' && userDir === 'des'
                      ? 'active-des'
                      : ''
                  }`}
                />
              </th>
              <th
                className="sortable-table-header"
                title="email"
                onClick={(evt) => {
                  sortUserTable(evt);
                }}
              >
                E-mail
                <div
                  className={`sortable-carrot ${
                    userSortingCategory === 'email' && userDir === 'asc'
                      ? 'active-asc'
                      : userSortingCategory === 'email' && userDir === 'des'
                      ? 'active-des'
                      : ''
                  }`}
                />
              </th>
              <th
                className="sortable-table-header"
                title="sharing"
                onClick={(evt) => {
                  sortUserTable(evt);
                }}
              >
                Sharing
                <div
                  className={`sortable-carrot ${
                    userSortingCategory === 'sharing' && userDir === 'asc'
                      ? 'active-asc'
                      : userSortingCategory === 'sharing' && userDir === 'des'
                      ? 'active-des'
                      : ''
                  }`}
                />
              </th>
              <th
                className="sortable-table-header"
                title="accesslevel_name"
                onClick={(evt) => {
                  sortUserTable(evt);
                }}
              >
                Access Level
                <div
                  className={`sortable-carrot ${
                    userSortingCategory === 'accesslevel_name' && userDir === 'asc'
                      ? 'active-asc'
                      : userSortingCategory === 'accesslevel_name' && userDir === 'des'
                      ? 'active-des'
                      : ''
                  }`}
                />
              </th>
              <th
                className="sortable-table-header"
                title="status_name"
                onClick={(evt) => {
                  sortUserTable(evt);
                }}
              >
                User Status
                <div
                  className={`sortable-carrot ${
                    userSortingCategory === 'status_name' && userDir === 'asc'
                      ? 'active-asc'
                      : userSortingCategory === 'status_name' && userDir === 'des'
                      ? 'active-des'
                      : ''
                  }`}
                />
              </th>
            </tr>
          </thead>
          <tbody>{usersList}</tbody>
        </table>
      </section>
    </div>
  );
}

export default ListOfUsersAndAccounts;
