import {
  Box,
  Card,
  Icon,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';

import BillingInfo from './BillingInfo';
import './SideBarMenu.scss';

function ProfileSideBar({
  menuTitle = '',
  selectedTab,
  setSelectedTab,
  userAccessLevel,
  tabOptions,
}) {
  const filteredTabsByPermission = Object.values(tabOptions).filter((item) =>
    item.userAccessLevel.includes(userAccessLevel)
  );

  const showBillingInfo = selectedTab === 'account-usage';

  return (
    <Box id="sidebar">
      <Card variant="outlined">
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }} disablePadding>
          <ListItem sx={{ background: '#f7f7f7' }}>
            <ListItemText primary={menuTitle} />
          </ListItem>
          {filteredTabsByPermission.map(({ id, icon, title }) => {
            const labelId = `checkbox-list-label-${id}`;

            return (
              <ListItem key={id} onClick={() => setSelectedTab(id)} disablePadding>
                <ListItemButton selected={selectedTab === id} dense>
                  <IconButton edge="start" aria-label="comments">
                    <Icon>{icon}</Icon>
                  </IconButton>
                  <ListItemText id={labelId} primary={title} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Card>

      {showBillingInfo && <BillingInfo />}
    </Box>
  );
}

export default ProfileSideBar;
