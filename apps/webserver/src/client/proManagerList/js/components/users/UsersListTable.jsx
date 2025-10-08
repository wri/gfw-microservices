import { Typography } from '@mui/material';

function UsersTable({ userSortingCategory, userDir, usersList, sortUserTable, searchUsers }) {
  const getSortClass = (column) => {
    if (userSortingCategory !== column) {
      return '';
    }
    return userDir === 'asc' ? 'active-asc' : 'active-desc';
  };

  return (
    <div>
      <section className="section-container">
        <Typography variant="h3" sx={{ mb: 2 }}>
          User Profiles
        </Typography>
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
                First Name
                <div className={`sortable-carrot ${getSortClass('first_name')}`} />
              </th>
              <th
                className="sortable-table-header"
                title="last_name"
                onClick={(evt) => {
                  sortUserTable(evt);
                }}
              >
                Last Name
                <div className={`sortable-carrot ${getSortClass('last_name')}`} />
              </th>
              <th
                className="sortable-table-header"
                title="organization_name"
                onClick={(evt) => {
                  sortUserTable(evt);
                }}
              >
                Organization Name
                <div className={`sortable-carrot ${getSortClass('organization_name')}`} />
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
                  className={`sortable-carrot ${getSortClass('organization_classifications')}`}
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
                <div className={`sortable-carrot ${getSortClass('email')}`} />
              </th>
              <th
                className="sortable-table-header"
                title="sharing"
                onClick={(evt) => {
                  sortUserTable(evt);
                }}
              >
                Sharing
                <div className={`sortable-carrot ${getSortClass('sharing')}`} />
              </th>
              <th
                className="sortable-table-header"
                title="accesslevel_name"
                onClick={(evt) => {
                  sortUserTable(evt);
                }}
              >
                Access Level
                <div className={`sortable-carrot ${getSortClass('accesslevel_name')}`} />
              </th>
              <th
                className="sortable-table-header"
                title="status_name"
                onClick={(evt) => {
                  sortUserTable(evt);
                }}
              >
                User Status
                <div className={`sortable-carrot ${getSortClass('status_name')}`} />
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
