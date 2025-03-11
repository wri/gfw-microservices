import imageUrlBuilder from '@sanity/image-url';
import sanityClient from '@sanity/client';

//TODO use env variables for projectId/dataset

export const client = sanityClient({
  projectId: 'kt7vr0rz',
  dataset: 'production',
  apiVersion: '2021-03-25',
  useCdn: true,
});

const builder = imageUrlBuilder(client);

export function urlForImage(source) {
  return builder.image(source);
}
