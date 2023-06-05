import React from 'react';
import SquadListItem from './SquadListItem';
import './SquadList.scss';

const SquadList = ({ data, activeItem, setActiveItem }) => {
  return (
    <>
      {data.map((connection) => (
        <SquadListItem
          country={connection.country}
          organizationName={connection.organizationName}
          date={connection.date}
          status={connection.status}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
        />
      ))}
    </>
  );
};

export default SquadList;
