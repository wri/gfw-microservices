import React from 'react';
import { useHistory } from 'react-router';
import Breadcrumbs from '../../../common/js/components/Breadcrumbs';
import LinkButton from '../../../common/js/components/LinkButton';
import { changeView, selectFolder } from '../../../locations/js/actions/locationActions';
import store from '../../../locations/js/store';
import { locationsPage } from '../../../common/js/config';
import { analysisTypesOptionsNewNames } from '../../../../config/env/analysisTypes.constants';
import featureFlags from '../../../../utils/general.utils';

const { isListDetailsPageRedesignAvailable } = featureFlags;

function DiagnosticsBreadCrumbs({
  selectedList,
  diagnosticName = '',
  isSharedList = false,
  isGfwList,
  analysisId,
}) {
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

  const diagnosticPath = isListDetailsPageRedesignAvailable
    ? `${diagnosticLabel} diagnostic`
    : diagnosticName;

  return (
    <Breadcrumbs>
      <LinkButton
        label={locationsPage.lists.locations}
        onClick={() => {
          window.location = '/locations';
        }}
      />
      {selectedList.folder && (
        <LinkButton
          label={selectedList.folder.name}
          onClick={() => changeFolderView(selectedList.folder)}
        />
      )}
      <LinkButton label={list_name} onClick={backToLists} />
      <span>{diagnosticPath}</span>
    </Breadcrumbs>
  );
}

export default DiagnosticsBreadCrumbs;
