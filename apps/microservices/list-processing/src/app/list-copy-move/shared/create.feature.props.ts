import { ListSchema } from '@wri-monorepos/sql';

export const createFeatureProps = (locationData) => {
  const fieldNames = Object.values(ListSchema.columns).map((column) => column.name);
  const featureProps = locationData.map((location) => {
    const props = {};

    fieldNames.forEach((fieldName) => {
      props[fieldName] = location[fieldName];
    });

    return props;
  });
  return featureProps;
};
