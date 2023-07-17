import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Icon from '@material-ui/core/Icon';
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

  return (
    <div className="side-bar-menu">
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
    </div>
  );
}

export default ProfileSideBar;
