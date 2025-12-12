import { useEffect, useState } from 'react';
import { Box, TextField } from '@mui/material';

import { saveAs } from 'file-saver';
import httpRequest from '../../../common/js/utils/httpRequest';
import { profilePage, locationsPage } from '../../../common/js/config';
import ModalLoader from '../../../common/js/components/Loaders/ModalLoader';
import IconArrowLeft from '../../../common/js/components/icon/IconArrowLeft';
import IconSearch from '../../../common/js/components/icon/IconSearch';
import '../../css/activityLog.scss';
import { Link, PillButton } from '../../../components';

function ActivityLog() {
  const [displayLoader, setDisplayLoader] = useState(true);
  const [activities, setActivities] = useState([]);
  const [filterStr, setFilterStr] = useState('');
  const [startDate, setStartDate] = useState({});
  const [endDate, setEndDate] = useState({});

  const getActivityLog = () => {
    httpRequest
      .fetchJSON('/activityLog', {})
      .then((response) => {
        const json = JSON.parse(response);
        const { activityLog } = json;
        setActivities(activityLog);
        setDisplayLoader(false);
      })
      .catch((err) => {
        setDisplayLoader(false);
        setActivities([]);
        console.log(err);
      });
  };

  useEffect(() => {
    getActivityLog();
  }, []);

  const createRow = (row, i) => {
    return (
      <tr key={i}>
        {Object.keys(row).map((td, j) => (
          <td id={td} key={j} className="activityLogger-table-td">
            {row[td]}
          </td>
        ))}
      </tr>
    );
  };

  const download = () => {
    const headers = 'Username,Category,Activity Name, Activity Description,Timestamp\n';
    const rows = activities.map((activity) => {
      const {
        activity_description,
        activity_time,
        activity_type_category_name,
        activity_type_name,
        email,
      } = activity;
      return `${email},${activity_type_category_name},${activity_type_name},${activity_description},${activity_time}`;
    });
    const csv = headers + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    saveAs(blob, 'activitylog.csv');
  };

  // startDate is initialized to 0 if no date is selected
  const start = isNaN(new Date(startDate)) ? 0 : new Date(startDate).setHours(0, 0, 0, 0);
  // endDate is initialized to 12/31/9999 if no date is selected
  const end = isNaN(new Date(endDate))
    ? new Date('12/31/9999')
    : new Date(endDate).setHours(23, 59, 59, 999);
  const filteredElements = activities.filter((activity) => {
    return (
      ((activity.email ? activity.email.toLowerCase().indexOf(filterStr.toLowerCase()) > -1 : '') ||
        activity.activity_type_name.toLowerCase().indexOf(filterStr.toLowerCase()) > -1 ||
        activity.activity_type_category_name.toLowerCase().indexOf(filterStr.toLowerCase()) > -1 ||
        activity.activity_description.toLowerCase().indexOf(filterStr.toLowerCase()) > -1) &&
      new Date(activity.activity_time) - start > 0 &&
      end - new Date(activity.activity_time) > 0
    );
  });
  const rows = filteredElements.map(createRow);

  return (
    <div className="activity-log">
      <ModalLoader open={displayLoader} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconArrowLeft height="10px" />
        <Link href="/profile">{profilePage.profileManager.backButton}</Link>
      </Box>

      <h1 className="profile-page__title">{profilePage.profileManager.activityLogTitle}</h1>

      <div className="activity-log__filter-bar">
        <div className="input-search activity-log__search-input input-field__inline-container">
          <IconSearch className="input-search__icon" />
          <input
            type="search"
            className="input-search__input"
            aria-label={profilePage.profileManager.searchLogs}
            onChange={(evt) => {
              setFilterStr(evt.target.value);
            }}
            value={filterStr}
          />
        </div>

        <div className="input-field__inline-container">
          <label htmlFor="profile-timeframe-start" className="block-label">
            {locationsPage.add.startDate}
          </label>

          <TextField
            id="profile-timeframe-start"
            type="date"
            className="profile-timeframe-start gfw-datepicker"
            value={
              startDate && startDate instanceof Date && !isNaN(startDate)
                ? startDate.toISOString().split('T')[0]
                : ''
            }
            onChange={(evt) => {
              setStartDate(evt.target.value ? new Date(evt.target.value) : {});
            }}
            InputLabelProps={{
              shrink: true,
            }}
            size="small"
          />
        </div>

        <div className="input-field__inline-container">
          <label htmlFor="profile-timeframe-end" className="block-label">
            {locationsPage.add.endDate}
          </label>

          <TextField
            id="profile-timeframe-end"
            type="date"
            className="profile-timeframe-end gfw-datepicker"
            value={
              endDate && endDate instanceof Date && !isNaN(endDate)
                ? endDate.toISOString().split('T')[0]
                : ''
            }
            onChange={(evt) => {
              setEndDate(evt.target.value ? new Date(evt.target.value) : {});
            }}
            InputLabelProps={{
              shrink: true,
            }}
            size="small"
          />
        </div>

        <PillButton variant="contained" onClick={download} sx={{ marginLeft: 'auto' }}>
          Download
        </PillButton>
      </div>
      {rows.length > 0 && (
        <div className="gfw-table-container">
          <table className="gfw-table">
            <thead>
              <tr>
                <th>{profilePage.profileManager.activityLogHeaders[0]}</th>
                <th>{profilePage.profileManager.activityLogHeaders[1]}</th>
                <th>{profilePage.profileManager.activityLogHeaders[2]}</th>
                <th>{profilePage.profileManager.activityLogHeaders[3]}</th>
                <th>{profilePage.profileManager.activityLogHeaders[4]}</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
      )}
      {!displayLoader && rows.length === 0 && (
        <div className="activity-log__no-results">
          <p className="activity-log__no-results-prompt">
            {locationsPage.lists.listsFilterNoMatch}
          </p>
          <PillButton
            color="info"
            onClick={() => {
              setFilterStr('');
              setStartDate({});
              setEndDate({});
            }}
            sx={{ margin: 'auto' }}
          >
            {locationsPage.lists.listsFilterClear}
          </PillButton>
        </div>
      )}
    </div>
  );
}

export default ActivityLog;
