import { parseKMZAndKMLFile } from '../uploading/UploadLocations.util';

export const handleKMZandKML = (file, setGeometry) => {
  return parseKMZAndKMLFile(file)
    .then((geometry) => {
      setGeometry(geometry);
    })
    .catch((e) => {
      console.error('Failed to parse KMZ/KML file', e);
    });
};
