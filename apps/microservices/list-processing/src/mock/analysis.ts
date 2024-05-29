import {
  Analysis,
  AnalysisSchema,
  AnalysisSchemaType,
  ClientStoreConnection,
  List,
  ListSchema,
  ListSchemaType,
  ListsAnalysisStatus,
} from '@wri-monorepos/sql';
import { EntitySchema, In } from 'typeorm';
import { mockData } from './data';
import * as moment from 'moment';

const repository = async (organizationDatabase: string, listId: number) => {
  const clientStoreConnection = new ClientStoreConnection();
  let connection = await clientStoreConnection.getConnection(organizationDatabase, [List]);
  const listRepository = connection.getRepository(List);
  const { listAnalysisTableName, listTableName } = (await listRepository.findOne({
    where: { id: listId },
  })) ?? {
    listAnalysisTableName: undefined,
    listTableName: undefined,
  };
  const AnalysisEntity = new EntitySchema<AnalysisSchemaType>({
    ...AnalysisSchema,
    name: listAnalysisTableName,
  });
  const ListEntity = new EntitySchema<ListSchemaType>({
    ...ListSchema,
    name: listTableName,
  });

  clientStoreConnection.clearCache(organizationDatabase);
  connection = await clientStoreConnection.getConnection(organizationDatabase, [
    List,
    Analysis,
    ListEntity,
    AnalysisEntity,
    ListsAnalysisStatus,
  ]);

  const getAllLocations = async () => {
    const listEntity = connection.getRepository(ListEntity);
    const allLocation = await listEntity.find();
    return allLocation;
  };

  const getAllLocationAnalysis = async () => {
    const listEntity = connection.getRepository(AnalysisEntity);
    const allLocation = await listEntity.find();
    return allLocation;
  };

  const deleteAllLocationsAnalysis = async (analysisIds: Array<number>) => {
    const listEntity = connection.getRepository(AnalysisEntity);
    const allLocation = await listEntity.delete({ id: In(analysisIds) });
    return allLocation;
  };

  const getListLevelAnalysisId = async () => {
    const analysisRepository = connection.getRepository(Analysis);
    const { id } = (await analysisRepository.findOne({ where: { listId: listId } })) ?? {
      id: undefined,
    };
    return id;
  };

  const deleteListLevelAnalysisId = async (analysisId: number) => {
    const analysisEntity = connection.getRepository(Analysis);
    await analysisEntity.delete({ id: analysisId });
  };

  const insertAllLocationAnalysis = async (
    locationLevelAnalysisData: Array<AnalysisSchemaType>
  ) => {
    await connection
      .createQueryBuilder()
      .insert()
      .into(AnalysisEntity)
      .values(locationLevelAnalysisData)
      .execute();
  };

  const insertListLevelAnalysis = async (analysis: Analysis) => {
    const analysisEntity = connection.getRepository(Analysis);
    analysisEntity.insert(analysis);
  };

  const insertListAnalysisStatus = async () => {
    const updateTime = moment().format('YYYY-MM-DD');
    const listsAnalysisStatusRepository = connection.getRepository(ListsAnalysisStatus);
    const { analysisId } = (await listsAnalysisStatusRepository.findOne({
      where: { listId: listId, analysisId: 'FCD' },
    })) ?? { analysisId: undefined };
    if (analysisId) {
      listsAnalysisStatusRepository.update(
        {
          listId: listId,
          analysisId: 'FCD',
        },
        {
          updateTime,
          status: 2,
        }
      );
    } else {
      listsAnalysisStatusRepository.insert({
        listId,
        analysisId: 'FCD',
        updateTime,
        status: 2,
      });
    }
  };

  return {
    connection,
    deleteAllLocationsAnalysis,
    deleteListLevelAnalysisId,
    getAllLocationAnalysis,
    getAllLocations,
    getListLevelAnalysisId,
    insertAllLocationAnalysis,
    insertListLevelAnalysis,
    insertListAnalysisStatus,
  };
};

type MockAnalysisFlowType = {
  organization_database: string;
  list_id: number;
  template_type: string;
};

//TODO need to figure out a way to use transaction, a lot of changes on the database
export const mockAnalysisFlow = async ({
  organization_database,
  list_id,
  template_type = 'cocoa_generic',
}: MockAnalysisFlowType) => {
  const {
    connection,
    deleteAllLocationsAnalysis,
    deleteListLevelAnalysisId,
    getAllLocationAnalysis,
    getAllLocations,
    getListLevelAnalysisId,
    insertAllLocationAnalysis,
    insertListAnalysisStatus,
    insertListLevelAnalysis,
  } = await repository(organization_database, list_id);

  const queryRunner = connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const allLocations = await getAllLocations();
    const allLocationAnalysis = await getAllLocationAnalysis();

    if (allLocationAnalysis.length > 0) {
      const analysisIds = allLocationAnalysis.map((l) => l.id);
      await deleteAllLocationsAnalysis(analysisIds);
    }
    const mockedLocationAnalysis = mockData[template_type].locationLevel;
    const mockedListAnalysis = mockData[template_type].analysisLevel;

    const newLocationLevelAnalysisData = [];
    for (let i = 0; i < allLocations.length; i++) {
      const location = allLocations[i];
      newLocationLevelAnalysisData.push({
        ...mockedLocationAnalysis,
        locationId: location.locationId,
        id: i + 1,
      });
    }

    await insertAllLocationAnalysis(newLocationLevelAnalysisData);
    const analysisId = await getListLevelAnalysisId();
    if (analysisId) {
      await deleteListLevelAnalysisId(analysisId);
    }

    const newListLevelAnalysis = {
      ...mockedListAnalysis,
      listId: list_id,
    };
    await insertListLevelAnalysis(newListLevelAnalysis);
    await insertListAnalysisStatus();
    await queryRunner.commitTransaction();
  } catch (err) {
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
  }
};
