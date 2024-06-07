This document focus in to the xls2geojson parser, which retrieves a buffer param to proccess the file, the main difference between xls2geojson and csv2geojson is that the xlsx file can't be readed as text, the file needs to be readed as a binary file, so the buffer is needed to be passed as a param to the xlsx parser.

The file can be readed from s3 as follows:

```javascript
const s3 = new AWS.S3({
  region: 'us-east-1', // Specify your bucket's region
});

const params = {
  Bucket: 'your-bucket-name',
  Key: 'your-file-name.xlsx',
};

const file = await s3.getObject(params).promise();
const buffer = file.Body;

const geojson = xls2geojson(buffer);
```

Or from a location in the file system:

```javascript
import * as fs from 'fs';
const fileBuffer: Buffer = fs.readFileSync(filePath);
const geojson = xls2geojson(fileBuffer);
```

To read a CSV file and store the content in a string:

```javascript
import { promises as fs } from 'fs';
const fileContent: string = await fs.readFile(filePath, { encoding: 'utf-8' });
const geojson = csv2geojson(fileContent);
```
