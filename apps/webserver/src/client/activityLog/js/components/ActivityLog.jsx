import React, { useEffect, useState } from 'react';
import DatePicker from 'material-ui/DatePicker';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { saveAs } from 'file-saver';
import httpRequest from '../../../common/js/utils/httpRequest';
import { profilePage, locationsPage } from '../../../common/js/config';
import ModalLoader from '../../../common/js/components/Loaders/ModalLoader';
import IconArrowLeft from '../../../common/js/components/icon/IconArrowLeft';
import IconSearch from '../../../common/js/components/icon/IconSearch';
import LinkButton from '../../../common/js/components/LinkButton';
import Button from '../../../common/js/components/Button';
import '../../css/activityLog.scss';

const primaryColor = '#8bae3b';
const muiTheme = getMuiTheme({
  palette: {
    primary1Color: primaryColor,
    primary2Color: primaryColor,
  },
});
muiTheme.fontFamily = 'Fira Sans, sans-serif';

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

      <LinkButton
        className="profile-page__back-button back-button"
        onClick={() => {
          window.location.href = '/profile';
        }}
        icon={<IconArrowLeft height="10px" />}
        label={profilePage.profileManager.backButton}
      />

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
          <MuiThemeProvider muiTheme={muiTheme}>
            <DatePicker
              id="profile-timeframe-start"
              hintText="yyyy-mm-dd"
              className="profile-timeframe-start gfw-datepicker"
              value={startDate}
              onChange={(evt, date) => {
                setStartDate(date);
              }}
            />
          </MuiThemeProvider>
        </div>

        <div className="input-field__inline-container">
          <label htmlFor="profile-timeframe-end" className="block-label">
            {locationsPage.add.endDate}
          </label>
          <MuiThemeProvider muiTheme={muiTheme}>
            <DatePicker
              id="profile-timeframe-end"
              hintText="yyyy-mm-dd"
              className="profile-timeframe-end gfw-datepicker"
              value={endDate}
              onChange={(evt, date) => {
                setEndDate(date);
              }}
            />
          </MuiThemeProvider>
        </div>

        <Button
          className="activity-log__action-button"
          variant="primary"
          onClick={() => download()}
          label="Download"
        />
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
          <LinkButton
            className="activity-log__no-results-clear"
            label={locationsPage.lists.listsFilterClear}
            onClick={() => {
              setFilterStr('');
              setStartDate({});
              setEndDate({});
            }}
          />
        </div>
      )}
    </div>
  );
}

export default ActivityLog;
