import { useHistory } from 'react-router';
import Breadcrumbs from '../../../common/js/components/Breadcrumbs';
import { Link } from '../../../components';
import { changeView, selectFolder } from '../../../locations/js/actions/locationActions';
import store from '../../../locations/js/store';
import { locationsPage } from '../../../common/js/config';
import { analysisTypesOptionsNewNames } from '../../../../config/env/analysisTypes.constants';

function DiagnosticsBreadCrumbs({ selectedList, isSharedList = false, isGfwList, analysisId }) {
  const history = useHistory();
  const { list_name, id } = selectedList;

  const changeFolderView = (folder) => {
    history.push('/folders');
    store.dispatch(selectFolder(folder));
    store.dispatch(changeView('folders'));
  };

  const backToLists = () => {
    window.location = `/list-details?id=${id}${isSharedList ? '&shared=true' : ''}${
      isGfwList ? '&gfw=true' : ''
    }`;
  };

  const diagnosticLabel = analysisTypesOptionsNewNames.find(
    ({ id }) => id === analysisId
  )?.shortLabel;

  const diagnosticPath = `${diagnosticLabel} diagnostic`;

  return (
    <Breadcrumbs>
      <Link
        onClick={() => {
          window.location = '/locations';
        }}
      >
        {locationsPage.lists.locations}
      </Link>
      {selectedList.folder && (
        <Link onClick={() => changeFolderView(selectedList.folder)}>
          {selectedList.folder.name}
        </Link>
      )}
      <Link onClick={backToLists}>{list_name}</Link>
      <span>{diagnosticPath}</span>
    </Breadcrumbs>
  );
}

export default DiagnosticsBreadCrumbs;
