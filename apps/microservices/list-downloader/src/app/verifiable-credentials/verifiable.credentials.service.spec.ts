import { GeoJson } from './types/verifiable-credential.model';
import { VerifiableCredentialService } from './verifiable.credentials.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('VerifiableCredentialsService', () => {
  let verifiableCredentialService: VerifiableCredentialService;
  const mockGeoJsonObject = [
    {
      type: 'Feature',
      properties: {
        Location_Name: 'Location Test 1',
        Latitude: '-25',
        Longitude: '-57',
        Analysis_Radius: '',
        Analysis_Area: '312490.27',
        Volume: '',
        Facility_Code: '',
        Slaughterhouse_Contact: '',
        Start_Date: '',
        End_Date: '',
        Time_Horizon: '',
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://geojson.org/geojson-ld/geojson-context.jsonld',
          'https://localhost:8443/geojson-defreport.jsonld',
        ],
        id: 'urn:uuid:0be8de79-4718-4767-9b77-99d3611c2c58',
        type: ['VerifiableCredential'],
        issuer: 'https://localhost:8443/vc-issuer/1',
        issuanceDate: '2024-11-06T00:08:20.017Z',
        expirationDate: '2025-11-06T00:08:20.017Z',
        credentialSubject: {
          geojson: {
            Centroid_Country: 'Country Location Test',
            Location_HA: 320,
            SBTN_Natural_Forest_HA: 199,
            SBTN_Natural_Forest_Loss_Post_2020_HA: 0,
            JRC_Forest_HA: 206,
            JRC_Forest_Loss_Post_2020_HA: 1,
            Analysis_Time: '2099-10-23T01:06:38.394Z',
            GFWPro_Account: 999,
            Use_Rights: 'Full Sharing',
          },
        },
        proof: {
          type: 'Ed25519Signature2018',
          created: '2024-11-06T00:08:20Z',
          verificationMethod: 'https://localhost:8443/publicKey/1',
          proofPurpose: 'assertionMethod',
          jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..HTOKxIOHposT7XT2iTSgay79XY4U-G5QLOFxyjzcwWoWtN5LkqLqYB-K4uM3obtHHBQpszSDV9N4PWLc3RHsCg',
        },
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[-56.98498102294124, -24.72951754382428]]],
      },
    },
  ];
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [VerifiableCredentialService],
    }).compile();

    verifiableCredentialService = module.get<VerifiableCredentialService>(
      VerifiableCredentialService
    );
  });
  const geojson: GeoJson = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[[-56.98498102294124, -24.72951754382428]]],
    },
    properties: {
      Location_Name: 'Location Test 1',
      Centroid_Country: 'Country Location Test',
      Location_HA: 320,
      SBTN_Natural_Forest_HA: 199,
      SBTN_Natural_Forest_Loss_Post_2020_HA: 0,
      JRC_Forest_HA: 206,
      JRC_Forest_Loss_Post_2020_HA: 1,
      Analysis_Time: '2099-10-23T01:06:38.394Z',
      GFWPro_Account: 999,
      Use_Rights: 'Full Sharing',
    },
  };
  it('should be defined', () => {
    expect(verifiableCredentialService).toBeDefined();
  });
  describe('singed-vc', () => {
    it('should return a signed a geoJson', async () => {
      verifiableCredentialService.signedVcOutput = jest
        .fn()
        .mockResolvedValueOnce(mockGeoJsonObject);
      const signedGeoJson = await verifiableCredentialService.signedVcOutput(geojson);
      expect(verifiableCredentialService.signedVcOutput).toHaveBeenCalled();
      expect(signedGeoJson).toEqual(mockGeoJsonObject);
    });
  });

  it('should throw an error if signing fails', async () => {
    const mockError = new Error('Signing failed');
    verifiableCredentialService.signedVcOutput = jest.fn().mockRejectedValueOnce(mockError);

    await expect(verifiableCredentialService.signedVcOutput(geojson)).rejects.toThrow(
      'Signing failed'
    );
  });

  describe('getEnvironmentBaseUrl', () => {
    it('should return the correct base URL for ProdV2 environment', () => {
      process.env.NODE_ENV = 'ProdV2';
      const baseUrl = verifiableCredentialService['getEnvironmentBaseUrl']();
      expect(baseUrl).toBe('https://pro.globalforestwatch.org');
    });

    it('should return the correct base URL for staging environment', () => {
      process.env.NODE_ENV = 'staging';
      const baseUrl = verifiableCredentialService['getEnvironmentBaseUrl']();
      expect(baseUrl).toBe('https://pro-staging.globalforestwatch.org');
    });

    it('should return the correct base URL for qa environment', () => {
      process.env.NODE_ENV = 'qa';
      const baseUrl = verifiableCredentialService['getEnvironmentBaseUrl']();
      expect(baseUrl).toBe('https://pro-qa.globalforestwatch.org');
    });

    it('should return the localhost base URL for other environments', () => {
      process.env.NODE_ENV = 'development';
      const baseUrl = verifiableCredentialService['getEnvironmentBaseUrl']();
      expect(baseUrl).toBe('https://localhost:8443');
    });
  });

  describe('resolveDocumentLoaderUrl', () => {
    const originalEnvironment = { ...process.env };

    afterEach(() => {
      process.env = { ...originalEnvironment };
    });

    it('should keep the public URL when no internal override is configured', () => {
      process.env.NODE_ENV = 'ProdV2';
      delete process.env.VC_CONTEXT_INTERNAL_BASE_URL;

      const resolvedUrl = verifiableCredentialService['resolveDocumentLoaderUrl'](
        'https://pro.globalforestwatch.org/geojson-defreport.jsonld'
      );

      expect(resolvedUrl).toBe('https://pro.globalforestwatch.org/geojson-defreport.jsonld');
    });

    it('should rewrite the geojson context URL to the internal base url when configured', () => {
      process.env.NODE_ENV = 'ProdV2';
      process.env.VC_CONTEXT_INTERNAL_BASE_URL = 'http://webserver:8080';

      const resolvedUrl = verifiableCredentialService['resolveDocumentLoaderUrl'](
        'https://pro.globalforestwatch.org/geojson-defreport.jsonld'
      );

      expect(resolvedUrl).toBe('http://webserver:8080/geojson-defreport.jsonld');
    });
  });
});
