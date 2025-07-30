import { deduceActiveId } from '../../../common/js/utils/templateUtils';
import { containsPunctuation, getListValidStatus } from '../../../locations/js/utils/lists.utils';

const filterValidTemplates = (template, activeTemplate, addType, commodityType) => {
  let templateId = 1;
  const validListStatus = getListValidStatus(template.list_status_id);
  if (addType === 'commodity') {
    let active = activeTemplate;

    if (active === 'investment') {
      if (commodityType === 'palmOil') {
        active = 'palmGeneric';
      } else if (commodityType === 'soy') {
        active = 'soyGeneric';
      } else if (commodityType === 'cattle') {
        active = 'cattleGeneric';
      } else if (commodityType === 'cocoa') {
        active = 'cocoaGeneric';
      }
    }
    templateId = deduceActiveId(active);
  }
  return template.template_id === templateId && validListStatus;
};

const filterValidCustom = (userList, customFields) => {
  let validCustom = true;

  const hasCustomAttributes = userList.custom_attribute_names?.length > 0;

  if (!hasCustomAttributes && customFields.length === 0) {
    //lets be explicit: no custom attribution involved
    validCustom = true;
  } else if (hasCustomAttributes && customFields.length === 0) {
    validCustom = false;
  } else if (!hasCustomAttributes && customFields.length > 0) {
    validCustom = false;
  } else if (hasCustomAttributes && customFields.length > 0) {
    //figure it out!
    const listCustomAttributes = userList.custom_attribute_names.split(',');
    if (listCustomAttributes.length !== customFields.length) {
      validCustom = false;
    } else {
      //same length, this could work!
      listCustomAttributes.forEach((listCustomAttribute) => {
        if (customFields.indexOf(listCustomAttribute) === -1) {
          validCustom = false;
        }
      });

      customFields.forEach((customField) => {
        if (listCustomAttributes.indexOf(customField) === -1) {
          validCustom = false;
        }
      });
    }
  }

  return validCustom;
};

const saveGfwListLocations = (
  selectedList,
  newListName,
  userListNames,
  userLists,
  selectedNewOrExisting,
  addType,
  activeTemplate,
  commodityType,
  templateData,
  uploadingData,
  selectedLists,
  moveToList,
  isSaveAsDraft
) => {
  return new Promise((resolve, reject) => {
    const listName = selectedNewOrExisting === 'new' ? newListName : selectedList.list_name;
    const lowerListName = listName ? listName.toLowerCase() : listName;
    const checkListExists = userListNames.includes(lowerListName);
    const checkForPunctuation = containsPunctuation(lowerListName);

    if (!listName) {
      reject('invalidListName');
      return;
    } else if (checkListExists && selectedNewOrExisting === 'new') {
      reject('listNameAlreadyExists');
      return;
    } else if (checkForPunctuation && selectedNewOrExisting === 'new') {
      reject('invalidListName');
      return;
    }

    // Check if target list would exceed 1500 locations limit
    if (
      selectedNewOrExisting === 'existing' &&
      moveToList &&
      moveToList.list_locations_count + uploadingData.length > 1500
    ) {
      reject('listTooLong');
      return;
    }

    // Extract location IDs from uploading data
    const selectedLocations = uploadingData.map((feature) => feature.location_id);

    // Determine action type (always copy for GFW lists)
    const action = 'copy';

    // Determine list type
    const listType = selectedNewOrExisting === 'new' ? 'new' : 'existing';

    // Prepare filters object (empty for GFW lists as they don't use filters)
    const filters = {
      country: null,
      state: null,
      subState: null,
      analysisAreaMin: null,
      analysisAreaMax: null,
      searchString: null,
    };

    // Prepare the standardized copy/move request
    const copyMoveRequest = {
      listId: selectedLists[0].id,
      selectedListLocationClassification:
        selectedList.list_name === 'Administrative Areas' ? 'Administrative Area' : 'Supply Shed',
      customAttributesNames: [], // GFW lists don't have custom attributes
      action: action,
      listType: listType,
      listName: listName,
      targetList: selectedNewOrExisting === 'existing' ? moveToList : undefined,
      selectedLocations: selectedLocations,
      addType: addType,
      activeTemplate: activeTemplate,
      commodityType: commodityType,
      saveAsDraft: isSaveAsDraft,
      userId: null, // Will be set by the server
      clientDatabase: null, // Will be set by the server
      organizationId: null, // Will be set by the server
      subscriptionStatusId: null, // Will be set by the server
      gfwListId: selectedLists[0].id,
      allLocationsSelected: false,
      filters: filters,
      srcListAnalysisTable: selectedList.list_analysis_table_name || null,
      userListNames: userListNames,
    };

    // Make request to the standardized copy/move endpoint
    fetch('/locations/cm-large-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(copyMoveRequest),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((responseText) => {
        try {
          const response = JSON.parse(responseText);

          if (response.success) {
            // Map the response to the expected format
            if (selectedNewOrExisting === 'new') {
              resolve('LocationAdded');
            } else {
              resolve('LocationAppended');
            }
          } else {
            reject(response.error || 'Copy/Move operation failed');
          }
        } catch (err) {
          // Handle non-JSON responses (legacy format)
          if (responseText === 'LocationAdded' || responseText === 'LocationAppended') {
            resolve(responseText);
          } else {
            reject(responseText);
          }
        }
      })
      .catch((err) => {
        reject(err);
        console.warn(`Error: ${err}`);
      });

    gtag('event', 'Next button clicked', {
      event_category: 'Add GFW Click',
      event_label: 'User copied locations from a GFW list',
    });
  });
};

module.exports = {
  filterValidTemplates,
  saveGfwListLocations,
  filterValidCustom,
};
