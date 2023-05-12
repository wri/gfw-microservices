import React from 'react';
import './Logo.scss';

function Logo({ isLoggedIn }) {
  return (
    <div className="logo">
      <a href={`/${isLoggedIn ? 'locations' : ''}`}>
        <div className="logo__image" />
      </a>
    </div>
  );
}

export default Logo;
