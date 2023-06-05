import React, { useEffect, useState } from 'react';
import Menu from 'material-ui/Menu';
import IconButton from 'material-ui/IconButton';
import Popover from 'material-ui/Popover';
import Icon from '@material-ui/core/Icon';
import { client } from './sanityClient';
import Notification from './Notification';
import './NewFeatureNotifications.scss';

const NewFeatureNotifications = () => {
  const [showList, setShowList] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsReadStatus, setNotificationsReadStatus] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const handleShow = (event) => {
    setAnchorEl(event.currentTarget);
    setShowList(true);
    gtag('event', 'In-App Notifications Icon Clicked', {
      event_category: 'In-App Notifications Click',
      event_label: 'User click on icon to display In-App Notifications',
    });
  };

  const handleClose = () => {
    setShowList(false);
  };

  const onMarkAllAsRead = () => {
    const readNotificationsIds = notifications.map(
      (notification) => `${notification.title}${notification.releaseDate}`
    );

    const now = new Date();
    const cookieExpire = new Date();
    const oneDay = 1000 * 60 * 60 * 24;
    cookieExpire.setTime(now.getTime() + oneDay * 365);

    // unset cookie
    document.cookie = 'notificationsReadStatus=; expires=0; path=/;';

    document.cookie = `notificationsReadStatus=${JSON.stringify(
      readNotificationsIds
    )}; expires=${cookieExpire.toUTCString()}; path=/;`;
    setNotificationsReadStatus(readNotificationsIds);
  };

  useEffect(() => {
    const isProd = process.env.NODE_ENV === 'production';
    const query = `*[_type == 'notifications'${isProd ? ' && showInProduction' : ''}]
    {
      title,
      icon,
      releaseDate,
      image,
      description,
    }
    | order(releaseDate desc)`;

    client
      .fetch(query)
      .then((data) => setNotifications(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    // read notificationsReadStatus from cookies
    const cookies = document.cookie.split(';').reduce((res, current) => {
      const [key, val] = current.trim().split('=');
      return Object.assign(res, { [key]: val });
    }, {});

    const notificationStatusFromCookies = cookies?.notificationsReadStatus
      ? JSON.parse(cookies.notificationsReadStatus)
      : [];
    setNotificationsReadStatus(notificationStatusFromCookies);
  }, [notifications]);

  useEffect(() => {
    const unread = notifications.filter(
      (i) => !notificationsReadStatus?.includes(`${i.title}${i.releaseDate}`)
    );
    setUnreadNotifications(unread.length);
  }, [notificationsReadStatus, notifications]);

  const notificationsList = notifications.map((data) => (
    <Notification
      key={`${data.title}${data.releaseDate}`}
      data={data}
      read={notificationsReadStatus?.includes(`${data.title}${data.releaseDate}`)}
    />
  ));

  return (
    <div className="drop-down-nav">
      <IconButton onClick={handleShow}>
        {unreadNotifications > 0 && (
          <span className="new-feature-notifications__unread-notifications">
            {unreadNotifications}
          </span>
        )}
        <Icon>campaign</Icon>
      </IconButton>
      <Popover
        className="new-feature-notifications"
        open={showList}
        anchorEl={anchorEl}
        onRequestClose={handleClose}
      >
        <Menu onClose={handleClose}>
          <div className="new-feature-notifications__header">
            <div>What&apos;s new</div>
            <IconButton onClick={handleClose}>
              <Icon>close</Icon>
            </IconButton>
          </div>
          <div className="new-feature-notifications__mark-as-read">
            <button type="button" onClick={onMarkAllAsRead}>
              Mark all as read
            </button>
          </div>
          {notificationsList}
        </Menu>
      </Popover>
    </div>
  );
};

export default NewFeatureNotifications;
