import { useProfileContext } from '../../ProfileStateContext';
import { Card, CardContent } from '@mui/material';
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
