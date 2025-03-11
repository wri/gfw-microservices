import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

function RegionChartsTabs({ regionsTabs, selectedTab, setSelectedTab }) {
  return (
    <Tabs
      value={selectedTab}
      onChange={(event, id) => {
        setSelectedTab(id);
      }}
      style={{ marginBottom: '1.7rem' }}
      TabIndicatorProps={{ style: { background: '#97bd3d' } }}
    >
      {regionsTabs.map(({ id, label }) => {
        return <Tab key={id} label={<span style={{ color: 'black' }}>{label}</span>} value={id} />;
      })}
    </Tabs>
  );
}

export default RegionChartsTabs;
