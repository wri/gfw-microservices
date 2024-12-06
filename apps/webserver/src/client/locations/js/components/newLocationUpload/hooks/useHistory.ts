import { useHistory as useHistoryRouterDom } from 'react-router-dom';
import { UploadLocationRoutes, RouteType } from '../UploadLocationRouter';

export const useHistory = () => {
  const history = useHistoryRouterDom();

  const push = (path: RouteType) => {
    history.push(UploadLocationRoutes[path]);
  };

  return { ...history, push };
};
