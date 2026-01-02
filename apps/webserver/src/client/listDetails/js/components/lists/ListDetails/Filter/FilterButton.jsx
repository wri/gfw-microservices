import { Button as MaterialButton, Badge } from '@mui/material';
import { FilterAlt } from '@mui/icons-material';

export default function FilterButton({ isFilterModalVisible, filterCount, onClick }) {
  const iconStyles = {
    color: 'black',
    marginRight: '10px',
    fontSize: '25px',
    marginTop: '3px',
  };

  return (
    <MaterialButton
      data-cy="filter-open-button"
      sx={{ minWidth: '35px', '& > svg': { margin: 0 } }}
      onClick={onClick}
    >
      {!isFilterModalVisible && filterCount > 0 ? (
        <Badge
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#97bd3d',
              color: 'white',
            },
          }}
          badgeContent={filterCount}
          overlap="circular"
        >
          <FilterAlt sx={iconStyles} />
        </Badge>
      ) : (
        <FilterAlt sx={iconStyles} />
      )}
    </MaterialButton>
  );
}
