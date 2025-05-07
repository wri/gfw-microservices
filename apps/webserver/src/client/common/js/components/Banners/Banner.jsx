import * as PropTypes from 'prop-types';
import React, { Component } from 'react';
import '../../../css/banner.scss';
import IconButton from '../IconButton';
import IconCheck from '../icon/IconCheck';
import IconLightbulbExclamation from '../icon/IconLightbulbExclamation';
import IconExclamationTriangle from '../icon/IconExclamationTriangle';
import IconStar from '../icon/IconStar';
import IconTimes from '../icon/IconTimes';
import IconLimit from '../icon/IconLimit';

export default class Banner extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { children, className, intent, onBannerClose } = this.props;
    return (
      <div className={`banner ${className ? className : ''} ${intent ? `banner--${intent}` : ''}`}>
        <div className="banner__inner">
          <div className="banner__content">
            {intent === 'alert' && <IconLightbulbExclamation className="banner__icon" />}
            {intent === 'danger' && <IconExclamationTriangle className="banner__icon" />}
            {intent === 'new' && <IconStar className="banner__icon" />}
            {intent === 'positive' && <IconCheck className="banner__icon" />}
            {intent === 'notice' && <IconLimit />}
            <div className="banner__prompt">{children}</div>
          </div>
          {onBannerClose && (
            <IconButton icon={<IconTimes />} size="medium" onClick={() => onBannerClose()} />
          )}
        </div>
      </div>
    );
  }
}

Banner.propTypes = {
  children: PropTypes.element.isRequired,
  className: PropTypes.string,
  intent: PropTypes.oneOf(['alert', 'danger', 'new', 'positive']),
};
