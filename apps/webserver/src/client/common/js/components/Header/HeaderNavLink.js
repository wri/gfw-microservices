import React from 'react';
import * as PropTypes from 'prop-types';

function HeaderNavLink({ active, link, label, className = '' }) {
  return (
    <a
      className={`header__nav-link ${active === link.replace('/', '') || active === true ? 'active' : ''} ${className}`}
      aria-label={label}
      href={link}
    >
      {label}
    </a>
  );
}

HeaderNavLink.propTypes = {
  active: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  link: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
};

HeaderNavLink.defaultProps = {
  className: '',
  active: false,
};

export default HeaderNavLink;
