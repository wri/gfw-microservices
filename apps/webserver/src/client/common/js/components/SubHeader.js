import React from 'react';

const SubHeader = (props) => (
  <div className={`page-header ${props.headerClassname ? props.headerClassname : ''}`}>
    <div className={`page-title-container ${props.titleClassname ? props.titleClassname : ''}`}>
      <h2 className={`page-title-text ${props.titleTextClassname ? props.titleTextClassname : ''}`}>
        {props.header}
      </h2>
      {props.subHeader ? <span className="page-subtitle-text">{props.subHeader}</span> : null}
    </div>
  </div>
);

export default SubHeader;
