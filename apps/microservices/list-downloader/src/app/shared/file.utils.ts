import * as readline from 'readline';
import * as archiver from 'archiver';
import * as fs from 'fs';
import { GenerationFileRequest } from '@wri-monorepos/sql';

const getAllFilesAndZip = async (filter: GenerationFileRequest) => {
  return new Promise((resolve, reject) => {
    const { key } = filter;
    const output = fs.createWriteStream(`/tmp/${key}.zip`);

    output.on('finish', async () => {
      output.destroy();
      resolve('ok');
    });

    output.on('error', (err) => {
      output.destroy();
      reject(err);
    });

    fs.readdir('/tmp', async (err, filenames) => {
      const files = filenames.filter((name) => name.includes(`${key}`));

      new Promise((resolve, reject) => {
        const array = [];
        let count = 1;
        files.forEach((file) => {
          getSpecificLine(`/tmp/${file}`, 2, (err, line) => {
            if (err) {
              reject(err);
            }

            if (line.trim() !== '') {
              array.push(file);
            }

            if (files.length === count) {
              resolve(array);
            }
            count += 1;
          });
        });
      }).then((filesToAppend: string[]) => {
        const archive = archiver('zip', {
          zlib: { level: 9 }, // Sets the compression level.
        });
        filesToAppend.forEach((file) => {
          archive.append(fs.createReadStream(`/tmp/${file}`), {
            name: `${file}`,
          });
        });
        archive.pipe(output);
        archive.finalize();
      });
    });
  });
};

const getSpecificLine = (path, row, callback) => {
  let i = 0;
  let content = '';
  const rs = fs
    .createReadStream(path, {
      encoding: 'utf8',
      autoClose: false,
    })
    .on('error', function (err) {
      rs.destroy();
      callback(err, content);
    });
  path = null;
  try {
    readline
      .createInterface({
        input: rs,
        terminal: false,
      })
      .on('line', function (line) {
        ++i;
        if (row == i) {
          try {
            content = line;
          } catch (e) {
            console.error(e);
          }
          this.close();
        }
      })
      .on('close', function () {
        rs.destroy();
        callback(null, content);
      })
      .on('error', function (err) {
        rs.destroy();
        callback(err, content);
      });
  } catch (err) {
    console.error(err);
    callback(err, content);
  }
};

export { getAllFilesAndZip };
