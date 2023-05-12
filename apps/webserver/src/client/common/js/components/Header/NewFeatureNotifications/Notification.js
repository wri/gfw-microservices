import React, { useState, useRef } from 'react';
import { PortableText } from '@portabletext/react';
import Popper from '@material-ui/core/Popper';
import Icon from '@material-ui/core/Icon';
import { urlForImage } from './sanityClient';
import './Notification.scss';

const NewFeatureNotification = ({ data, read }) => {
  const [showImagePopover, setShowImagePopover] = useState(false);
  const [imageAnchorEl, setImageAnchorEl] = useState(null);
  const notificationItemRef = useRef(null);
  const imagePopoverEnter = () => {
    setImageAnchorEl(notificationItemRef.current);
    setShowImagePopover(true);
  };

  const imagePopoverLeave = () => {
    setShowImagePopover(false);
  };

  return (
    <div
      ref={notificationItemRef}
      className={`new-feature-notification${read ? ' new-feature-notification--read' : ''}`}
    >
      <div style={{ cursor: 'default' }} className="new-feature-notification__menu-item">
        <div className="new-feature-notification__icon">
          <Icon>{data?.icon?.name}</Icon>
        </div>
        <div className="new-feature-notification__container">
          <div className="new-feature-notification__heading">
            <div className="new-feature-notification__title">{data?.title}</div>
            <div className="new-feature-notification__date">{data?.releaseDate}</div>
          </div>
          <div className="new-feature-notification__description">
            <div>
              <PortableText value={data?.description} />
            </div>
          </div>
          {data.image && (
            <div>
              <Icon
                style={{ cursor: 'pointer', border: '1px solid black' }}
                onMouseEnter={imagePopoverEnter}
                onMouseLeave={imagePopoverLeave}
              >
                gif
              </Icon>
            </div>
          )}
        </div>
      </div>
      {data.image && (
        <Popper
          style={{ paddingRight: '10px', zIndex: '99999', position: 'relative' }}
          open={showImagePopover}
          anchorEl={imageAnchorEl}
          placement="left-start"
        >
          <img className="new-feature-notification__image" src={urlForImage(data.image).url()} alt={data?.title} />
        </Popper>
      )}
    </div>
  );
};

export default NewFeatureNotification;
