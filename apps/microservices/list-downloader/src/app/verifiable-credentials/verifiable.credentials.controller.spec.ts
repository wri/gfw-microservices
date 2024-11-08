import { Test, TestingModule } from '@nestjs/testing';
import { VerifiableCredentialsController } from './verifiable.credentials.controller';
import { VerifiableCredentialService } from './verifiable.credentials.service';
import { GeoJsonSchema } from './types/geojson.schema';

jest.mock('@digitalbazaar/vc', () => ({
  __esModule: true,
  ...jest.requireActual('@digitalbazaar/vc'),
}));

jest.mock('@digitalbazaar/ed25519-signature-2018', () => ({
  __esModule: true,
  Ed25519Signature2018: jest.fn(),
}));

jest.mock('@digitalbazaar/ed25519-verification-key-2018', () => ({
  __esModule: true,
  Ed25519VerificationKey2018: jest.fn(),
}));

describe('VerifiableCredentialsController', () => {
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
        Location_Name: '1',
        Centroid_Country: 'Ghana',
        Location_HA: 320,
        SBTN_Natural_Forest_HA: 199,
        SBTN_Natural_Forest_Loss_Post_2020_HA: 0,
        JRC_Forest_HA: 206,
        JRC_Forest_Loss_Post_2020_HA: 1,
        Analysis_Time: '2024-10-23T01:06:38.394Z',
        GFWPro_Account: 1,
        Use_Rights: 'Full Sharing',
      };
      await controller.signedVcOutput(geojson);
      expect(verifiableCredentialService.signedVcOutput).toHaveBeenCalled();
    });
  });
});
