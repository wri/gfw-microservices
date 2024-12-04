import { useHistory as useHistoryRouterDom } from 'react-router-dom';
import { Routes, RouteType } from '../UploadLocationRouter';

export const useHistory = () => {
  const history = useHistoryRouterDom();

  const push = (path: RouteType) => {
    history.push(Routes[path]);
  };

  return { ...history, push };
};
