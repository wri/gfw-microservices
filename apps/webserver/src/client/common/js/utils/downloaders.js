import JSZip from 'jszip';
import FileSaver from 'file-saver';

/**
 * Converting csv string to blob URL
 * @param {String} CSVString - CSV string representation
 * @returns {ArrayBufferLike} - CSV blob url link
 * @private
 */
const _createCSVBlobUrl = (CSVString) => {
  const fileType = { type: 'text/csv;charset=utf-8' };
  const csvBlob = new Blob([CSVString], fileType);
  return window.URL
    ? window.URL.createObjectURL(csvBlob)
    : window.webkitURL.createObjectURL(csvBlob);
};

const _generateCSVContent = (csvData) => csvData.map((row) => row.join(',')).join('\n');

export const downloadCSV = (csvData) => {
  const csvContent = _generateCSVContent(csvData);

  if (navigator.msSaveOrOpenBlob) {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    navigator.msSaveOrOpenBlob(blob, 'download.csv');
    return;
  }

  const blobUri = _createCSVBlobUrl(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', blobUri);
  link.setAttribute('download', 'download.csv');

  let isAppended = false;
  try {
    document.body.appendChild(link);
    isAppended = true;
    link.click();
  } finally {
    if (isAppended) {
      document.body.removeChild(link);
    }
  }
};

export const downloadZIP = (csvDataArr, names) => {
  const zip = new JSZip();

  csvDataArr.forEach((arr, i) => {
    let csvContent = '';
    arr.forEach(function (dataRow) {
      const dataString = dataRow.join(',');
      csvContent += dataString + '\n';
    });

    zip.file(`${names[i]}.csv`, csvContent);
  });

  const promise = zip.generateAsync({ type: 'blob' });

  promise.then((res) => {
    FileSaver.saveAs(res, 'result.zip');
  });
};
