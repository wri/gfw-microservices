### Mapbox Styling
- https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#fill
- https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#circle

### GFW Datasets
- https://data-api.globalforestwatch.org/datasets/

### GFW VectorTileServer 
- https://tiles.globalforestwatch.org/wdpa_protected_areas/v202102/default/VectorTileServer

### GFW VectorTileServer - Style
- https://tiles.globalforestwatch.org/wdpa_protected_areas/v202010/default/root.json

### RSPO Palm Mils
```
const GFW_LIST = 'rspo_oil_palm';
const queryField = 'gfw_geostore_id';
const IDs = ['6b32c533-f086-ecab-1e36-e0d450cb4af4', '2c5e2391-5133-6bce-9215-b4986bb15158'];
const type = 'fill';
const date = 'latest';
```

### Oil Palm Concessions
```
const GFW_LIST = 'gfw_oil_palm';
const queryField = 'gfw_geostore_id';
const IDs = ['a8fa5907-e98b-a321-3217-c638eef9cf52'];
const type = 'fill';
const date = 'latest';
```

### RSPO Palm Concessions
```
const GFW_LIST = 'rspo_oil_palm';
const queryField = 'gfw_geostore_id';
const IDs = ['e6ffbadb-47f1-6cf9-0545-8c76be006341'];
const type = 'fill';
const date = 'latest';
```

### Protected Areas
```
const GFW_LIST = 'wdpa_protected_areas';
const queryField = 'gfw_geostore_id';
const IDs = ['e0e3de53-527f-9817-2837-3458dc2d722a'];
const type = 'fill';
const date = 'v202010';
```

### Palm oil Mills
```
const GFW_LIST = 'gfw_universal_mill_list';
const queryField = 'uml_id';
const IDs = ['PO1000008154', 'PO1000004269'];
const type = 'circle';
const date = 'latest';
```
