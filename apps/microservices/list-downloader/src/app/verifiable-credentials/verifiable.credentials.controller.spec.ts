import { Test, TestingModule } from '@nestjs/testing';
import { VerifiableCredentialsController } from './verifiable.credentials.controller';
import { VerifiableCredentialService } from './verifiable.credentials.service';
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
      await controller.signedVcOutput();
      expect(verifiableCredentialService.signedVcOutput).toHaveBeenCalled();
    });
  });
});
