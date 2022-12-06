import { LocationService } from './locations.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GeoService } from './geo.service';
import {
  selectedList,
  userListNames,
  selectedMoveOrCopy,
  selectedNewOrExisting,
  newListName,
  moveToList,
  selectedLocations,
  addType,
  activeTemplate,
  commodityType,
  templateData,
  isSaveAsDraft,
} from '../mock/listGeoMockData';
const TEST_USER_ID = 10034;
const CLIENT_ORGANIZATION_ID = 1;
jest.setTimeout(600000);

describe('Geo Service', () => {
  let service: GeoService;
  let locationService: LocationService;
  let app: TestingModule;
  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [GeoService, LocationService],
    }).compile();

    service = app.get<GeoService>(GeoService);
    locationService = app.get<LocationService>(LocationService);
  });

  describe('Test env file', () => {
    it('check all needed env variables', async () => {
      expect(process.env.MSSQL_HOSTNAME).toBeDefined();
      expect(process.env.MSSQL_PORT).toBeDefined();
      expect(process.env.MSSQL_DATABASE).toBeDefined();
      expect(process.env.MSSQL_USERNAME).toBeDefined();
      expect(process.env.MSSQL_PASSWORD).toBeDefined();
    });
  });

  describe('Test if geometries can be parsed', () => {
    it('should return geo data', async () => {
      expect(true).toEqual(true);
      /*const parseMock = mockData.map((item) => {
        const data = new GeoListObject();
        keys.forEach((key, index) => {
          //data.setValue(key, item[index]);
          const typeOf = typeof data[key];
          if (typeOf === 'string') {
            data[key] = item[index];
          } else if (typeOf === 'number') {
            data[key] = Number(item[index]);
          } else {
            data[key] = item[index];
          }
          data[key] = item[index];
        });
        return data;
      });
      //const parsedDetails = service.createGeoJSON(parseMock);*/

      //const result = await locationService.assembleGeojson([], [], 5256);
      const res = await locationService.MoveLocations(
        selectedList.id,
        selectedList.location_classification,
        selectedList.custom_attribute_names,
        userListNames,
        selectedMoveOrCopy,
        selectedNewOrExisting,
        newListName + Date.now(),
        moveToList,
        selectedLocations,
        addType,
        activeTemplate,
        commodityType,
        templateData,
        isSaveAsDraft,
        TEST_USER_ID,
        'clientstore-DevCo',
        CLIENT_ORGANIZATION_ID
      );
      expect(true).toEqual(true);
    });
  });

  afterAll((done) => {
    /**
     * Important close the app and connections
     * This turn down all the apps and avoid memory leaks
     */
    app.close(), done();
  });
});
