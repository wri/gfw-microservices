import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

function AnalysesTabs({ listView, changeListView, listViewOptions }) {
  return (
    <Tabs
      value={listView}
      onChange={(e, newValue) => changeListView(newValue)}
      style={{ color: 'black', background: 'none' }}
      TabIndicatorProps={{ style: { display: 'none' } }} // Remove the default indicator
    >
      <Tab
        label="POST-2000 TREE COVER LOSS"
        value="forest_change"
        sx={{
          backgroundColor: listView === 'forest_change' ? 'white' : '#e5e5e5',
          color: 'black',
          '&.Mui-selected': {
            color: 'black',
            backgroundColor: 'white',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
          },
        }}
      />

      {listViewOptions.length > 1 && (
        // only display Commodity Risk / Forest Change view toggle in Commodity Risk lists

        <Tab
          label="COMMODITY RISK"
          value="commodity_risk"
          sx={{
            backgroundColor: listView === 'commodity_risk' ? 'white' : '#e5e5e5',
            color: 'black',
            '&.Mui-selected': {
              color: 'black',
              backgroundColor: 'white',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
            },
          }}
        />
      )}
    </Tabs>
  );
}

export default AnalysesTabs;
