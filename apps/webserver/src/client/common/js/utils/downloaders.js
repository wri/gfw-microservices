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
  return window.URL ? window.URL.createObjectURL(csvBlob) : window.webkitURL.createObjectURL(csvBlob);
};

const downloadResults = (csvData) => {
  let csvContent = '';
  csvData.forEach(function (dataRow) {
    const dataString = dataRow.join(',');
    csvContent += dataString + '\n';
  });

  const blobUri = _createCSVBlobUrl(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', blobUri);
  link.setAttribute('download', 'download.csv');

  document.body.appendChild(link);

  if (navigator.msSaveOrOpenBlob) {
    csvContent = '';
    csvData.forEach(function (dataRow) {
      const dataString = dataRow.join(',');
      csvContent += dataString + '\n';
    });
    const blob = new Blob([csvContent], { type: 'text/csv' });
    navigator.msSaveOrOpenBlob(blob, 'download.csv');
  } else {
    link.click();
  }
  document.body.removeChild(link);
};

export const downloadCSV = (csvData) => {
  let csvContent = '';
  csvData.forEach(function (dataRow) {
    const dataString = dataRow.join(',');
    csvContent += dataString + '\n';
  });

  const blobUri = _createCSVBlobUrl(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', blobUri);
  link.setAttribute('download', 'download.csv');

  document.body.appendChild(link);

  if (navigator.msSaveOrOpenBlob) {
    csvContent = '';
    csvData.forEach(function (dataRow) {
      const dataString = dataRow.join(',');
      csvContent += dataString + '\n';
    });
    const blob = new Blob([csvContent], { type: 'text/csv' });
    navigator.msSaveOrOpenBlob(blob, 'download.csv');
  } else {
    link.click();
  }
  document.body.removeChild(link);
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

module.exports = {
  downloadCSV,
  downloadResults,
  downloadZIP,
};
