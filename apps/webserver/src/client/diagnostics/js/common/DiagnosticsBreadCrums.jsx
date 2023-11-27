import React from 'react';
import { useHistory } from 'react-router';
import Breadcrumbs from '../../../common/js/components/Breadcrumbs';
import LinkButton from '../../../common/js/components/LinkButton';
import { changeView, selectFolder } from '../../../locations/js/actions/locationActions';
import store from '../../../locations/js/store';
import { locationsPage } from '../../../common/js/config';

function DiagnosticsBreadCrums({ selectedList, diagnosticName = '', isSharedList = false }) {
  const history = useHistory();
  const { list_name, id, isGfwList } = selectedList;

  const changeFolderView = (folder) => {
    history.push('/folders');
    store.dispatch(selectFolder(folder));
    store.dispatch(changeView('folders'));
  };

  const backToLists = () => {
    window.location = `/locations?id=${id}${isSharedList ? '&shared=true' : ''}${
      isGfwList ? '&gfw=true' : ''
    }`;
  };

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
      <span>{diagnosticName}</span>
    </Breadcrumbs>
  );
}

export default DiagnosticsBreadCrums;
