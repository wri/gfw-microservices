import { Test } from '@nestjs/testing';
import { EmailService } from '@wri-monorepos/aws';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { ConstantsConfig, ConstantsConfigIds } from '@wri-monorepos/constants';
import { ConnectionUseCases } from './connection.use-case';
import { ConnectionRepositorySP } from '../domain/connection.repository.sp';
import { ConnectionRequestRepository } from '../domain/connection.repository';
import { ConnectionDataMapper } from './connection.mapper';
import { ActivityLogUseCases } from '../../ActivityLog/application/activity-log.use-case';
import Result from '../../Shared/domain/result';
import {
  Connection,
  ConnectionInvitation,
  ConnectionStatus,
} from '../domain/connection';
import { ConnectionUpdateStatusHttpDto } from './dtos/connection-status.dto';
import { CreateConnectionDto } from './dtos/connection.dto';
import { ConnectionGetDto } from './dtos/connection-get.dto';
import { QueryCriteria } from '../../Shared/domain/criteria/query';
import { SearchResult } from '../../Shared/domain/types';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { ConnectionRequest } from '../domain/connection.entity';

const moduleMocker = new ModuleMocker(global);
describe('ConnectionUseCases', () => {
  let connectionUseCases: ConnectionUseCases;
  let logsUseCasesMock: ActivityLogUseCases;
  let emailServiceMock: EmailService;
  let mapperMock: ConnectionDataMapper;

  const mockConnections: Connection[] = [
    {
      id: 97,
      createDate: new Date('2023-06-28T19:57:09.090Z'),
      editedDate: new Date('2023-06-28T19:57:09.090Z'),
      description: 'Connection has been created but not accepted',
      sourceEmail: 'jose.quiroz.5@wriconsultant.org',
      editorEmail: 'jose.quiroz.5@wriconsultant.org',
      sourceOrganization: 'DevCo',
      targetOrganization: 'DevCo2',
      status: ConnectionStatus.pending,
    },
    {
      id: 88,
      createDate: new Date('2023-06-14T18:18:03.297Z'),
      editedDate: new Date('2023-06-28T19:50:57.273Z'),
      description: 'Request has expired',
      sourceEmail: 'icollins@wri.org',
      editorEmail: 'gfw-pro',
      sourceOrganization:
        "TIMTelefónica_Telefónica-Telefónica'Telefónica L.T.D",
      targetOrganization: 'DevCo',
      status: ConnectionStatus.expired,
    },
  ];

  const mockRepositorySP: ConnectionRepositorySP = {
    createConnection: jest.fn(),
    getConnections: jest.fn(async () => {
      return Result.ok(mockConnections);
    }),
    updateStatusConnection: jest.fn(),
    getUserAdminOrganization: jest.fn(),
    resendConnection: jest.fn(),
  };

  const mockRepository: ConnectionRequestRepository = {
    search: jest.fn(),
    getConnectionRequestID: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ConnectionUseCases,
        {
          provide: ConnectionRepositorySP,
          useValue: mockRepositorySP,
        },
        {
          provide: ConnectionRequestRepository,
          useValue: mockRepository,
        },
        ConnectionDataMapper,
        ActivityLogUseCases,
        EmailService,
        ConstantsConfig[ConstantsConfigIds.B2B_STATUS],
      ],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();
    connectionUseCases = moduleRef.get<ConnectionUseCases>(ConnectionUseCases);
    logsUseCasesMock = moduleRef.get<ActivityLogUseCases>(ActivityLogUseCases);
    emailServiceMock = moduleRef.get<EmailService>(EmailService);
    mapperMock = moduleRef.get<ConnectionDataMapper>(ConnectionDataMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get connections', () => {
    it('should get connections', async () => {
      const expectedResult: ConnectionGetDto[] = [
        {
          id: 97,
          createDate: 'Wed Jun 28 2023',
          editedDate: 'Wed Jun 28 2023',
          description: 'Connection has been created but not accepted',
          sourceEmail: 'jose.quiroz.5@wriconsultant.org',
          editorEmail: 'jose.quiroz.5@wriconsultant.org',
          sourceOrganizationName: 'DevCo',
          targetOrganizationName: 'DevCo2',
          status: 'pending',
        },
        {
          id: 88,
          createDate: 'Wed Jun 14 2023',
          editedDate: 'Wed Jun 28 2023',
          description: 'Request has expired',
          sourceEmail: 'icollins@wri.org',
          editorEmail: 'gfw-pro',
          sourceOrganizationName:
            "TIMTelefónica_Telefónica-Telefónica'Telefónica L.T.D",
          targetOrganizationName: 'DevCo',
          status: 'expired',
        },
      ];

      jest
        .spyOn(mockRepositorySP, 'getConnections')
        .mockResolvedValue(
          new Promise((resolve) => resolve(Result.ok(mockConnections))),
        );

      const filtersDto = {};
      const result = await connectionUseCases.getConnections(filtersDto);

      expect(mockRepositorySP.getConnections).toHaveBeenCalledWith(filtersDto);
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual(expectedResult);
    });

    describe('get connections by filters', () => {
      it('should filter by id', async () => {
        const expectedResult: ConnectionGetDto[] = [
          {
            id: 97,
            createDate: 'Wed Jun 28 2023',
            editedDate: 'Wed Jun 28 2023',
            description: 'Connection has been created but not accepted',
            sourceEmail: 'jose.quiroz.5@wriconsultant.org',
            editorEmail: 'jose.quiroz.5@wriconsultant.org',
            sourceOrganizationName: 'DevCo',
            targetOrganizationName: 'DevCo2',
            status: 'pending',
          },
        ];

        jest
          .spyOn(mockRepositorySP, 'getConnections')
          .mockResolvedValue(
            new Promise((resolve) =>
              resolve(
                Result.ok(
                  mockConnections.filter((connection) => connection.id === 97),
                ),
              ),
            ),
          );
        const filtersDto = { id: 97 };
        const result = await connectionUseCases.getConnections(filtersDto);
        expect(mockRepositorySP.getConnections).toHaveBeenCalledWith(
          filtersDto,
        );
        expect(result.isSuccess).toBe(true);
        expect(result.getValue()).toEqual(expectedResult);
      });

      it('should filter by status', async () => {
        const expectedResult: ConnectionGetDto[] = [
          {
            id: 97,
            createDate: 'Wed Jun 28 2023',
            editedDate: 'Wed Jun 28 2023',
            description: 'Connection has been created but not accepted',
            sourceEmail: 'jose.quiroz.5@wriconsultant.org',
            editorEmail: 'jose.quiroz.5@wriconsultant.org',
            sourceOrganizationName: 'DevCo',
            targetOrganizationName: 'DevCo2',
            status: 'pending',
          },
        ];

        jest
          .spyOn(mockRepositorySP, 'getConnections')
          .mockResolvedValue(
            new Promise((resolve) =>
              resolve(
                Result.ok(
                  mockConnections.filter(
                    (connection) => connection.status === 'pending',
                  ),
                ),
              ),
            ),
          );
        const filtersDto = { status: 'pending' };
        const result = await connectionUseCases.getConnections(filtersDto);
        expect(mockRepositorySP.getConnections).toHaveBeenCalledWith(
          filtersDto,
        );
        expect(result.isSuccess).toBe(true);
        expect(result.getValue()).toEqual(expectedResult);
      });
    });
  });

  describe('create connection', () => {
    it('should create a connection and return true', async () => {
      const createConnectionDto: CreateConnectionDto = {
        sourceEmail: 'icollins@wri.org',
        targetEmail: 'jose.quiroz.5@wriconsultant.org',
        targetOrganization: 17,
        sourceOrganization: 1,
      };

      const invitation: ConnectionInvitation = {
        sourceEmail: 'icollins@wri.org',
        targetEmail: 'jose.quiroz.5@wriconsultant.org',
        sourceOrganization: 1,
        targetOrganization: 17,
      };

      const expectedResult = Result.ok(true);

      jest
        .spyOn(mockRepositorySP, 'createConnection')
        .mockResolvedValue(new Promise((resolve) => resolve(Result.ok(1))));

      jest
        .spyOn(logsUseCasesMock, 'saveActivityLog')
        .mockResolvedValue(new Promise((resolve) => resolve(Result.ok(true))));

      jest
        .spyOn(emailServiceMock, 'sendEmail')
        .mockResolvedValue(new Promise(() => null));

      jest
        .spyOn(mapperMock, 'createConnectionDtotoConnectionInvitation')
        .mockReturnValue(invitation);

      const result = await connectionUseCases.createConnection(
        createConnectionDto,
      );

      expect(logsUseCasesMock.saveActivityLog).toHaveBeenCalledTimes(2);
      expect(emailServiceMock.sendEmail).toHaveBeenCalled();
      expect(mockRepositorySP.createConnection).toHaveBeenCalled();
      expect(
        mapperMock.createConnectionDtotoConnectionInvitation,
      ).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('accept connection', () => {
    it('should accept a connection and return true', async () => {
      const id = 1;
      const connectionHttpDto: ConnectionUpdateStatusHttpDto = {
        editEmail: 'jose.quiroz.5@wriconsultant.org',
      };

      jest
        .spyOn(mockRepositorySP, 'updateStatusConnection')
        .mockResolvedValue(new Promise((resolve) => resolve(Result.ok(1))));

      const expectedResult = Result.ok(true);

      const result = await connectionUseCases.acceptConnection(
        id,
        connectionHttpDto,
      );

      expect(mockRepositorySP.updateStatusConnection).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('reject connection', () => {
    it('should reject a connection and return true', async () => {
      const id = 1;
      const connectionHttpDto: ConnectionUpdateStatusHttpDto = {
        editEmail: 'jose.quiroz.5@wriconsultant.org',
      };

      jest
        .spyOn(mockRepositorySP, 'updateStatusConnection')
        .mockResolvedValue(new Promise((resolve) => resolve(Result.ok(1))));

      const expectedResult = Result.ok(true);

      const result = await connectionUseCases.rejectConnection(
        id,
        connectionHttpDto,
      );

      expect(mockRepositorySP.updateStatusConnection).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('cancel connection', () => {
    it('should cancel a connection and return true', async () => {
      const id = 1;
      const connectionHttpDto: ConnectionUpdateStatusHttpDto = {
        editEmail: 'jose.quiroz.5@wriconsultant.org',
      };

      jest
        .spyOn(mockRepositorySP, 'updateStatusConnection')
        .mockResolvedValue(new Promise((resolve) => resolve(Result.ok(1))));

      const expectedResult = Result.ok(true);

      const result = await connectionUseCases.cancelConnection(
        id,
        connectionHttpDto,
      );

      expect(mockRepositorySP.updateStatusConnection).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('search connections', () => {
    it('should search connection and return them', async () => {
      const query: QueryCriteria = new QueryCriteria([], []);
      const orgId = '1';
      const items = [];
      const searchResult: SearchResult<ConnectionRequest> = {
        count: 1,
        offset: 0,
        limit: 10,
        items,
      };
      const expectedResult: ResultPromise<SearchResult<ConnectionRequest>> =
        new Promise((resolve) => resolve(Result.ok(searchResult)));

      jest
        .spyOn(mockRepository, 'search')
        .mockResolvedValue(
          new Promise((resolve) => resolve(Result.ok(searchResult))),
        );

      const result = await connectionUseCases.search(query, orgId);

      expect(mockRepository.search).toHaveBeenCalled();
      expect(result).toEqual(await expectedResult);
    });
  });

  describe('get connections request ID', () => {
    it('should return a connection request object', async () => {
      const orgId1 = 1;
      const orgId2 = 2;
      const connectionRequest: ConnectionRequest = {
        id: 1,
        idSourceOrganization: 2,
        idTargetOrganization: 3,
        createDate: new Date('2020-01-01'),
        sourceEmail: '',
        initialTargetEmail: '',
      };
      const expectedResult: ResultPromise<ConnectionRequest> = new Promise(
        (resolve) => resolve(Result.ok(connectionRequest)),
      );

      jest
        .spyOn(mockRepository, 'getConnectionRequestID')
        .mockResolvedValue(
          new Promise((resolve) => resolve(Result.ok(connectionRequest))),
        );

      const result = await connectionUseCases.getConnectionRequestID(
        orgId1,
        orgId2,
      );

      expect(mockRepository.getConnectionRequestID).toHaveBeenCalled();
      expect(result).toEqual(await expectedResult);
    });
  });
});
