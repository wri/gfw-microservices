import React from 'react';
import { useProfileContext } from '../../ProfileStateContext';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import UserProfileManager from './UserProfileManager';

export default function UserProfileManagerContainer() {
  const { users } = useProfileContext();

  return (
    <Card>
      <CardContent>
        <UserProfileManager users={users} />
      </CardContent>
    </Card>
  );
}
