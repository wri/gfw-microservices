import fetch from '../../../../common/js/utils/fetch';

export const getFolders = () => {
  return fetch({
    url: '/folder',
    headers: { 'Content-type': 'application/json' },
  });
};
