import React from 'react';

function UsersTable({ userSortingCategory, userDir, usersList, sortUserTable, searchUsers }) {
  return (
    <div className="profile-body">
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

export default UsersTable;
