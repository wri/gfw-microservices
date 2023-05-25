import { LocationService } from '@wri-monorepos/geo';
import {
  CopyOrMoveLargeListRequest,
  RequestTriggerProcessLargeList,
} from './../models/index';
import { TestingModule } from '@nestjs/testing';
import fetch from 'node-fetch';
import { AppController } from './app.controller';
import * as fs from 'fs';
import * as uniqId from 'uniqid';

describe('AppController', () => {
  let app: TestingModule;
  const targetDatabase = 'DevCo'; // change if the database where you want to perform the test is different

  beforeEach((): void => {
    jest.setTimeout(60000);
  });

  beforeAll(async () => {
    /*app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, LargeListService, LocationService, GeoService],
      imports: [
        AppModule,
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({ useClass: DatabaseService }),
      ],
    }).compile();*/
  });

  describe('Upload a single file with a presigned url', () => {
    xit('Controller should return PresignedURL from Service', async () => {
      const appController = app.get<AppController>(AppController);
      const presignedURL = appController.generatePreSignedUrl({
        key: 'test.csv',
        contentType: 'text/csv',
      });

      expect(presignedURL).toHaveProperty('url');
      const currentPath = process.cwd();
      const file = fs.readFileSync(currentPath + '/test_files/test.csv');

      const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'text/csv' },
        body: file,
      };

      const response = await fetch(presignedURL.url, requestOptions);
      expect(response.status).toBe(200);
    });
  });

  describe('Flow process to upload a file and then replace it', () => {
    xit('Should return a presigned URL upload a new file and then make a replacement for this file', async () => {
      const appController = app.get<AppController>(AppController);
      let presignedURL = appController.generatePreSignedUrl({
        key: 'test.csv',
        contentType: 'text/csv',
      });

      const fileNameToReplace = presignedURL.keyFile;

      expect(presignedURL).toHaveProperty('url');

      const currentPath = process.cwd();

      const file = fs.readFileSync(currentPath + '/test_files/test.csv');
      const replacementFileContent = fs.readFileSync(
        currentPath + '/test_files/test-replacement.csv'
      );

      let requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'text/csv' },
        body: file,
      };

      let response = await fetch(presignedURL.url, requestOptions);
      expect(response.status).toBe(200);

      presignedURL = appController.generatePreSignedUrl({
        key: fileNameToReplace,
        contentType: 'text/csv',
        replaceFile: true,
      });

      requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'text/csv' },
        body: replacementFileContent,
      };

      response = await fetch(presignedURL.url, requestOptions);
      expect(response.status).toBe(200);
    });
  });

  describe('getObjectPresignedURL', () => {
    xit('Get a presigned URL to Download a file previously uploaded', () => {
      const appController = app.get<AppController>(AppController);
      const url = appController.getObjectPresignedURL({
        key: 'test.csv',
      });
      expect(url).toHaveProperty('url');
    });
  });

  describe('saveListToProcess', () => {
    xit('Should save a list to process', async () => {
      const appController = app.get<AppController>(AppController);
      const result = await appController.saveListToProcess({
        key: 'test123123-test.csv',
        userId: 13322,
        list_id: 123,
        listName: 'test list name for LLP',
        client_database: targetDatabase,
      });
      expect(result).not.toBeUndefined();
      console.log(result);
    });
  });

  describe('Start large list process', () => {
    xit('Should start a list analysis process', async () => {
      const appController = app.get<AppController>(AppController);
      const result = await appController.processLargeList({
        organization_id: 1,
        list_id: 2082,
        path: 's3://gfwpro-geotrellis-pre-data/TESTING/cocoa_generic_point.zip',
        template_type: 'cocoa_generic',
        user_id: 10011,
        startAnalysis: true,
      });

      expect(result).toEqual({
        executionArn: expect.any(String),
        startDate: expect.any(Number),
      });
    });
  });

  describe('Large list process', () => {
    xit('Start large list process', async () => {
      const appController = app.get<AppController>(AppController);
      const listName = `Implementation For LargeListProccess${uniqId()}`;
      const userId = 22;
      const requestLargeListCreation: RequestTriggerProcessLargeList = {
        client_database: targetDatabase,
        list_name: listName,
        user_id: userId,
      };
      const result = await appController.triggerProcessLargeList(
        requestLargeListCreation
      );

      expect(result).toEqual({
        list_id: expect.any(Number),
      });
    });
  });

  describe('Whole Process to upload large list and trigguer the proccess', () => {
    xit('Upload file, Save the list and trigguer the proccess', async () => {
      const appController = app.get<AppController>(AppController);
      // Variables to be used for test
      const listName = `Implementation For LargeListProccess${uniqId()}`;
      const userId = 10034; // Ismael ID

      // Generate presigned URL to upload file
      const presignedURL = appController.generatePreSignedUrl({
        key: 'cocoa_generic_point.zip',
        contentType: 'application/zip',
      });

      expect(presignedURL).toHaveProperty('url');

      // Upload the file to presigned URL
      const currentPath = process.cwd();
      const file = fs.readFileSync(
        currentPath + '/test_files/cocoa_generic_point.zip'
      );

      const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/zip' },
        body: file,
      };

      const response = await fetch(presignedURL.url, requestOptions);
      expect(response.status).toBe(200);

      const requestLargeListProcess: RequestTriggerProcessLargeList = {
        client_database: targetDatabase,
        list_name: listName,
        user_id: userId,
      };
      const trigguerProccessResult =
        await appController.triggerProcessLargeList(requestLargeListProcess);

      expect(trigguerProccessResult).toEqual({
        list_id: expect.any(Number),
      });

      const trigguerLargeListProcessResult =
        await appController.processLargeList({
          organization_id: 1,
          list_id: trigguerProccessResult.list_id,
          path: presignedURL.fileS3Route,
          template_type: 'cocoa_generic',
          user_id: userId,
          startAnalysis: true,
        });

      expect(trigguerLargeListProcessResult).toEqual({
        executionArn: expect.any(String),
        startDate: expect.any(Number),
      });
    });
  });

  describe('Whole Process to copy a full list and save as draft', () => {
    xit('copy all locations from a list and save as draft', async () => {
      const locationService = app.get<LocationService>(LocationService);
      const listName = `Copy entire list to new test ${uniqId()}`;
      const userId = 10034; // Ismael ID
      const request: CopyOrMoveLargeListRequest = {
        listId: 961,
        selectedListLocationClasification: 'Supply Shed',
        customAttributesNames: [],
        userListNames: [],
        action: 'copy',
        listType: 'new',
        listName: listName,
        targetList: null,
        selectedLocations: [
          88, 298, 1261, 901, 1262, 902, 904, 899, 903, 900, 898, 304, 300, 302,
          905, 1255, 303, 305, 1263, 306, 908, 307, 910, 308, 909, 41, 309, 915,
          1266, 917, 918, 323, 324, 325, 922, 924, 327, 925, 328, 329, 330, 331,
          332, 333, 334, 335, 926, 337, 338, 1264,
        ],
        addType: 'commodity',
        activeTemplate: 'palmGeneric',
        commodityType: '',
        saveAsDraft: true,
        userId: userId,
        clientDatabase: 'clientstore-QACo',
        organizationId: 1,
        gfwListId: 0,
        allLocationsSelected: true,
        filters: { analysisAreaMin: 0 },
        srcListAnalysisTable: 'analysis-recentpalmoilgeneric3',
        templateData: [
          {
            id: 124,
            template_id: 5,
            template_datum_field_name: 'Location Name',
            template_datum_field_description:
              'Name of the location, name of the Mill, name of the farm',
            template_datum_type_id: 7,
            template_datum_mandatory: true,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 125,
            template_id: 5,
            template_datum_field_name: 'Latitude',
            template_datum_field_description: '',
            template_datum_type_id: 3,
            template_datum_mandatory: true,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 126,
            template_id: 5,
            template_datum_field_name: 'Longitude',
            template_datum_field_description: '',
            template_datum_type_id: 3,
            template_datum_mandatory: true,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 127,
            template_id: 5,
            template_datum_field_name: 'Analysis Radius',
            template_datum_field_description: '',
            template_datum_type_id: 3,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 128,
            template_id: 5,
            template_datum_field_name: 'Analysis Area',
            template_datum_field_description: '',
            template_datum_type_id: 3,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 129,
            template_id: 5,
            template_datum_field_name: 'Commodity',
            template_datum_field_description: 'Palm Oil',
            template_datum_type_id: 7,
            template_datum_mandatory: true,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 130,
            template_id: 5,
            template_datum_field_name: 'Location Classification',
            template_datum_field_description:
              'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area',
            template_datum_type_id: 7,
            template_datum_mandatory: true,
            template_datum_system: true,
            ui_type: 'single-dropdown',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 131,
            template_id: 5,
            template_datum_field_name: 'Company ID',
            template_datum_field_description:
              "Unique ID assigned by user's company to the point or polygon",
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 132,
            template_id: 5,
            template_datum_field_name: 'Volume',
            template_datum_field_description:
              'Volume of commodity originating from the point or polygon in megatons',
            template_datum_type_id: 2,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 133,
            template_id: 5,
            template_datum_field_name: 'Owner Name',
            template_datum_field_description:
              'Name of the owner of the point or polygon',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 134,
            template_id: 5,
            template_datum_field_name: 'Owner ID',
            template_datum_field_description:
              'Unique ID of the owner of the point or polygon',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 135,
            template_id: 5,
            template_datum_field_name: 'Parent Company',
            template_datum_field_description:
              'Company name associated with the point or polygon',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 136,
            template_id: 5,
            template_datum_field_name: 'Supplier Name',
            template_datum_field_description:
              'Supplier name (i.e. the name of the supplier this point or polygon is associated with that user sources from - only applicable if user does not own the mill)',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 137,
            template_id: 5,
            template_datum_field_name: 'Facility Name',
            template_datum_field_description:
              "Name of the point's or polygon's associated processing facility (e.g. mill, crusher, grinder)",
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 138,
            template_id: 5,
            template_datum_field_name: 'Refinery Name',
            template_datum_field_description:
              "Name of the point's or polygon's associated refinery (associated with Supplier) ",
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 139,
            template_id: 5,
            template_datum_field_name: 'Second Supplier Name',
            template_datum_field_description:
              'Supplier name (i.e. the name of the direct/tier 1 supplier  this point or polygon is associated with that user sources from)',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 140,
            template_id: 5,
            template_datum_field_name: 'Second Refinery Name',
            template_datum_field_description:
              'Associated refinery name (associated with Supplier 2)',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 141,
            template_id: 5,
            template_datum_field_name: 'Oil Type',
            template_datum_field_description:
              'Type of oil: Palm Oil, Palm Kernel Oil',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'single-dropdown',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 142,
            template_id: 5,
            template_datum_field_name: 'RSPO Model',
            template_datum_field_description:
              'RSPO model: IP, MB, SG, MB/SG, MB/IP',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'single-dropdown',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 143,
            template_id: 5,
            template_datum_field_name: 'Certification',
            template_datum_field_description:
              'Yes means this point or polygon is certified; No means this point or polygon is not certified',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'single-dropdown',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 144,
            template_id: 5,
            template_datum_field_name: 'Start Date',
            template_datum_field_description: 'Location timeframe - start date',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 145,
            template_id: 5,
            template_datum_field_name: 'End Date',
            template_datum_field_description: 'Location timeframe - end date',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 146,
            template_id: 5,
            template_datum_field_name: 'Time Horizon',
            template_datum_field_description:
              'Location timeframe - time horizon',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 147,
            template_id: 5,
            template_datum_field_name: 'Accuracy Rating of Location Entered',
            template_datum_field_description:
              "Very Confident, Moderately Confident, Not Confident, Don't Know",
            template_datum_type_id: 2,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 148,
            template_id: 5,
            template_datum_field_name: 'Attribute1',
            template_datum_field_description: 'Additional Attribute 1 Value',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: false,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 149,
            template_id: 5,
            template_datum_field_name: 'Attribute2',
            template_datum_field_description: 'Additional Attribute 2 Value',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: false,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 150,
            template_id: 5,
            template_datum_field_name: 'Attribute3',
            template_datum_field_description: 'Additional Attribute 3 Value',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: false,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 151,
            template_id: 5,
            template_datum_field_name: 'Country',
            template_datum_field_description: '',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 152,
            template_id: 5,
            template_datum_field_name: 'State',
            template_datum_field_description: '',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 153,
            template_id: 5,
            template_datum_field_name: 'Sub State',
            template_datum_field_description: '',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 154,
            template_id: 5,
            template_datum_field_name: 'Wind Barrier',
            template_datum_field_description: '',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 155,
            template_id: 5,
            template_datum_field_name: 'Riparian Buffers',
            template_datum_field_description: '',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 156,
            template_id: 5,
            template_datum_field_name: 'Buffer Zones',
            template_datum_field_description: '',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
          {
            id: 157,
            template_id: 5,
            template_datum_field_name: 'gadmid',
            template_datum_field_description: '',
            template_datum_type_id: 7,
            template_datum_mandatory: false,
            template_datum_system: true,
            ui_type: 'input',
            location_type_id: 2,
            template_name: 'Palm Oil Generic',
            location_type_name: 'Commodity',
          },
        ],
      };

      await locationService.MoveLocations(
        request.listId,
        request.selectedListLocationClasification,
        request.customAttributesNames,
        request.userListNames,
        request.action,
        request.listType,
        request.listName,
        request.targetList,
        request.selectedLocations,
        request.addType,
        request.activeTemplate,
        request.commodityType,
        request.templateData,
        request.saveAsDraft,
        request.userId,
        request.clientDatabase,
        request.organizationId,
        request.gfwListId,
        request.allLocationsSelected,
        request.filters,
        request.srcListAnalysisTable
      );
    });
  });

  afterAll(() => {
    /**
     * Important close the app and connections
     * This turn down all the apps and avoid memory leaks
     */
    // app.close(), done();
  });
});
