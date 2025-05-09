import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListTemplate } from '@wri-monorepos/sql';
import { Repository } from 'typeorm';
import { ValidateCsvRepository } from './validate.csv.repository';

describe('ValidateCsvRepository', () => {
  let service: ValidateCsvRepository;
  let repository: Repository<ListTemplate>;

  const mockListTemplates = [
    { id: 1, name: 'Template 1' },
    { id: 2, name: 'Template 2' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateCsvRepository,
        {
          provide: getRepositoryToken(ListTemplate, 'default'),
          useValue: {
            find: jest.fn().mockResolvedValue(mockListTemplates),
          },
        },
      ],
    }).compile();

    service = module.get<ValidateCsvRepository>(ValidateCsvRepository);
    repository = module.get<Repository<ListTemplate>>(getRepositoryToken(ListTemplate, 'default'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllListTemplates', () => {
    it('should return all list templates', async () => {
      const result = await service.getAllListTemplates();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(mockListTemplates);
    });

    it('should handle empty result', async () => {
      jest.spyOn(repository, 'find').mockResolvedValueOnce([]);

      const result = await service.getAllListTemplates();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle repository error', async () => {
      const error = new Error('Database error');
      jest.spyOn(repository, 'find').mockRejectedValueOnce(error);

      await expect(service.getAllListTemplates()).rejects.toThrow(error);
      expect(repository.find).toHaveBeenCalled();
    });
  });
});
