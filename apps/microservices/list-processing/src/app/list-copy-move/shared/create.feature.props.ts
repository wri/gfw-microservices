import { ListSchema } from '@wri-monorepos/sql';

export const createFeatureProps = (locationData) => {
  const fieldNames = Object.values(ListSchema.columns).map((column) => column.name);
  const featureProps = locationData.map((location) => {
    return fieldNames.map((fieldName) => location[fieldName]);
  });
  return featureProps;
};
