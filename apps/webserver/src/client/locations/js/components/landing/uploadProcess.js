import axios from 'axios';

const renameProp = (oldProp, newProp, { [oldProp]: old, ...others }) => ({
  [newProp]: old,
  ...others,
});

const fileExtensions = {
  csv: 'text/csv',
  kml: 'application/vnd.google-earth.kml+xml',
  kmz: 'application/vnd.google-earth.kmz',
  xls: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip',
  json: 'application/json',
  geojson: 'application/json',
};
function getFileType(extension) {
  if (extension in fileExtensions) {
    return fileExtensions[extension];
  }
  return undefined;
}

const createPresignedUrlStep = async (param) => {
  const { largeListFile } = param;
  const fileExtension = largeListFile.name.split('.').pop()?.toLowerCase() ?? '';
  try {
    const { data } = await axios.post('/locations/create-presigned-url', {
      key: largeListFile.name,
      contentType: getFileType(fileExtension),
    });
    return { ...param, ...data };
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const uploadFileStep = async (param) => {
  const { largeListFile, url, uploadFileToS3 } = param;
  try {
    await uploadFileToS3(largeListFile, url, largeListFile.type);
    return param;
  } catch (error) {
    throw new Error(error);
  }
};

const createLargeListStep = async (param) => {
  const { listName, analysisIds = [], commodity, saveAsDraft = false } = param;
  try {
    const { data } = await axios.post('/locations/create-large-list', {
      listName,
      analysisIds,
      saveAsDraft,
      commodity,
    });
    return { ...param, ...data };
  } catch (error) {
    throw new Error(error);
  }
};

const saveListToProcessStep = async (param) => {
  const { listName, keyFile, list_id: listID } = param;

  try {
    const { data } = axios.post('/locations/save-list-to-process', {
      list_id: listID,
      key: keyFile,
      listName,
    });
    return { ...param, ...data };
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const processListStep = async (param) => {
  const {
    list_id: listID,
    fileS3Route,
    listName,
    commodity,
    analysisIds,
    saveAsDraft = false,
  } = param;

  try {
    const { data } = await axios.post('/locations/process-list', {
      list_id: listID,
      path: fileS3Route,
      template_type: 'cocoa_generic',
      startAnalysis: true,
      listName,
      saveAsDraft,
      commodity,
      analysisTypesParam: Object.fromEntries(analysisIds.map((key) => [key, true])),
    });
    return { ...param, ...data };
  } catch (error) {
    throw new Error(error);
  }
};

const promiseCompose =
  (...functions) =>
  (...initialArgs) => {
    return functions
      .reduceRight((currFunc, nextFunc) => {
        return (...arg) =>
          currFunc.call(this, ...arg).then((resolvedV) => nextFunc.call(this, resolvedV));
      })
      .call(this, ...initialArgs);
  };

function uploadProcess(list, uploadFileToS3, largeListFile, isExistingList, analysisIds) {
  let newList = { ...list, analysisIds };
  const createProcess = promiseCompose(
    processListStep,
    saveListToProcessStep,
    createLargeListStep,
    uploadFileStep,
    createPresignedUrlStep
  );
  const appendProcess = promiseCompose(processListStep, uploadFileStep, createPresignedUrlStep);

  let task = createProcess;
  if (isExistingList) {
    task = appendProcess;
    newList = renameProp('id', 'list_id', newList);
    newList = renameProp('list_name', 'listName', newList);
  }

  return task({
    ...newList,
    uploadFileToS3,
    largeListFile,
    commodity: '', // old upload ignores commodity
  });
}

export function uploadProcessByPrevUploadedFile({
  listName,
  analysisIds,
  keyFile,
  existingList,
  fileS3Route,
  saveAsDraft,
  commodity,
}) {
  const processPipeline = existingList?.id
    ? promiseCompose(processListStep)
    : promiseCompose(processListStep, saveListToProcessStep, createLargeListStep);

  return processPipeline({
    listName,
    analysisIds,
    keyFile,
    fileS3Route,
    saveAsDraft,
    commodity,
    list_id: existingList?.id,
    existingListAnalysisIds: existingList?.analysisIds,
  });
}

export default uploadProcess;
