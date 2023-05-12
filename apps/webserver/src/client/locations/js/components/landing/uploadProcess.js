const axios = require('axios');

const renameProp = (oldProp, newProp, { [oldProp]: old, ...others }) => ({
  [newProp]: old,
  ...others,
});

const createPresignedUrlStep = async (param) => {
  const { largeListFile } = param;
  try {
    const { data } = await axios.post('/locations/create-presigned-url', {
      key: largeListFile.name,
      contentType: largeListFile.type,
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
  const { listName } = param;
  try {
    const { data } = await axios.post('/locations/create-large-list', { listName });
    return { ...param, ...data };
  } catch (error) {
    throw new Error(error);
  }
};

const saveListToProcessStep = async (param) => {
  const { listName, keyFile, list_id: listID } = param;

  try {
    const { data } = axios.post('/locations/save-list-to-process', { list_id: listID, key: keyFile, listName });
    return { ...param, ...data };
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const processListStep = async (param) => {
  const { list_id: listID, fileS3Route, listName } = param;

  try {
    const { data } = await axios.post('/locations/process-list', {
      list_id: listID,
      path: fileS3Route,
      template_type: 'cocoa_generic',
      startAnalysis: true,
      listName,
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
        return (...arg) => currFunc.call(this, ...arg).then((resolvedV) => nextFunc.call(this, resolvedV));
      })
      .call(this, ...initialArgs);
  };

function uploadProcess(list, uploadFileToS3, largeListFile, isExistingList) {
  let newList = { ...list };
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
  });
}

export default uploadProcess;
