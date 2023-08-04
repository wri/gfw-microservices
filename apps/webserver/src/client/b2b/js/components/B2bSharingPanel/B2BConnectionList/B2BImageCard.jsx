import React from 'react';
import Card from '@mui/material/Card';
import B2BImageList from './B2BImageList';

function B2BImageCard(props) {
  return (
    <Card style={{ textAlign: 'center', padding: '40px', marginTop: '25px' }}>
      <div>
        <B2BImageList />
        <h3>{props.title}</h3>

        <div style={{ color: 'gray' }}>
          {props.children}
        </div>
      </div>
    </Card>
  );
}

export default B2BImageCard;
