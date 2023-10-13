import {describe, expect, test} from '@jest/globals';
import {AfiFileService} from './afi.file.service';
import * as fs from 'fs';

const data = [
  {
    "listId": 5642,
    "listName": "kgTestCG3 927 all",
    "locationId": 2,
    "gadmId": null,
    "coverageHA": 742.2031451586759,
    "naturalForestLossHA": 8.743208131482211,
    "totalAreaHa": 1256.1646821446757,
    "negligibleRisk": 100,
    "statusCode": 2,
    "locationError": null,
    "locationName": "L1",
    "country": "Brazil",
    "state": "Amazonas",
    "subState": "Lábrea"
  },
  {
    "listId": 5642,
    "listName": "kgTestCG3 927 all",
    "locationId": 3,
    "gadmId": null,
    "coverageHA": 251.69314385190685,
    "naturalForestLossHA": 90.35210599890917,
    "totalAreaHa": 1256.4203696590005,
    "negligibleRisk": 100,
    "statusCode": 2,
    "locationError": null,
    "locationName": "L3",
    "country": "Brazil",
    "state": "Acre",
    "subState": "Porto Acre"
  },
  {
    "listId": 5642,
    "listName": "kgTestCG3 927 all",
    "locationId": 1,
    "gadmId": null,
    "coverageHA": 419.6845973241104,
    "naturalForestLossHA": 13.769003244052165,
    "totalAreaHa": 1256.217339121448,
    "negligibleRisk": 100,
    "statusCode": 2,
    "locationError": null,
    "locationName": "L2",
    "country": "Brazil",
    "state": "Amazonas",
    "subState": "Lábrea"
  }
];

describe('AFI File Service', () => {

  const afiFileService = new AfiFileService();

  beforeAll(() => {
    afiFileService.startEmail = jest.fn();
    afiFileService.errorEmail = jest.fn();
    afiFileService.finishedEmail = jest.fn();
  });


  test('Location level analysis data', async () => {
    const filters = {
      listId: 5642,
      key: 'tmp-key',
    }
    afiFileService.start(filters);


    afiFileService.process(data);


    await afiFileService.finish(filters);

    const csvData = fs.readFileSync('/tmp/tmp-key_afi.csv', 'utf8');
    const lines = csvData.toString().split('\n');
    expect(lines).toStrictEqual([
      "List Name,Location Name,Country,State,Sub State,Coverage (ha),Natural Forest Loss (ha),Negligible Risk (%)",
     "kgTestCG3 927 all,L1,Brazil,Amazonas,Lábrea,742.2031451586759,8.743208131482211,100",
     "kgTestCG3 927 all,L3,Brazil,Acre,Porto Acre,251.69314385190685,90.35210599890917,100",
     "kgTestCG3 927 all,L2,Brazil,Amazonas,Lábrea,419.6845973241104,13.769003244052165,100",
      "",
    ]);
  });
});
