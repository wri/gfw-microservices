import { Test, TestingModule } from '@nestjs/testing';
import { VerifiableCredentialsController } from './verifiable.credentials.controller';
import { VerifiableCredentialService } from './verifiable.credentials.service';
import { GeoJsonSchema } from './types/geojson.schema';
describe('ListMessageController', () => {
  let controller: VerifiableCredentialsController;
  let verifiableCredentialService: VerifiableCredentialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerifiableCredentialsController],
      providers: [
        VerifiableCredentialService,
        {
          provide: VerifiableCredentialService,
          useValue: {
            signedVcOutput: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = await module.resolve<VerifiableCredentialsController>(
      VerifiableCredentialsController
    );
    verifiableCredentialService = module.get<VerifiableCredentialService>(
      VerifiableCredentialService
    );
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('singed-vc', () => {
    it('should call signedVcOutput', async () => {
      const geojson: GeoJsonSchema = {
        type: 'Feature',
        properties: {
          Location_Name: '1',
          Latitude: '7.06',
          Longitude: '-2.65',
          Analysis_Radius: '1',
          Analysis_Area: '11',
          Location_Classification: 'Property',
          Company_ID: 'local',
          Volume: '1',
          Owner_Name: '',
          Owner_ID: '',
          Company_Name: '',
          Supplier_Name: '',
          Facility_Name: '',
          Refinery_Name: '',
          Certification: '',
          Start_Date: '',
          End_Date: '',
          Time_Horizon: '',
          Centroid_Country: 'Ghana',
          Location_HA: 320,
          SBTN_Natural_Forest_HA: 199,
          SBTN_Natural_Forest_Loss_Post_2020_HA: 0,
          JRC_Forest_HA: 206,
          JRC_Forest_Loss_Post_2020_HA: 1,
          Analysis_Time: '2024-10-23T01:06:38.394Z',
          GFWPro_Account: 1,
          Use_Rights: 'Full Sharing',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-2.648250109074639, 7.063750308462165],
              [-2.649009757076574, 7.062480077376962],
              [-2.650130549210577, 7.062778955279363],
              [-2.65113926213118, 7.063650682494698],
              [-2.650006016751243, 7.0641363590861],
              [-2.648250109074639, 7.063750308462165],
            ],
          ],
        },
      };
      await controller.signedVcOutput(geojson);
      expect(verifiableCredentialService.signedVcOutput).toHaveBeenCalled();
    });
  });
});
