import {
  Analyses,
  AnalysisSchema,
  AnalysisSchemaType,
  ClientStoreConnection,
  Lists,
  ListSchema,
  ListSchemaType,
  ListsAnalysisStatus,
} from '@wri-monorepos/sql';
import { EntitySchema, In } from 'typeorm';
import { mockData } from './data';

const repository = async (organizationDatabase: string, listId: number) => {
  const clientStoreConnection = new ClientStoreConnection();
  let connection = await clientStoreConnection.getConnection(organizationDatabase, [Lists]);
  const listRepository = connection.getRepository(Lists);
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

  connection = await clientStoreConnection.getConnection(organizationDatabase, [
    Lists,
    Analyses,
    ListEntity,
    AnalysisEntity,
    ListsAnalysisStatus,
  ]);

  const getAllLocations = async () => {
    const listEntity = connection.getRepository(ListEntity);
    const allLocation = await listEntity.find();
    return allLocation;
  };

  const deleteAllLocationsAnalysis = async (locationIds: Array<number>) => {
    const listEntity = connection.getRepository(AnalysisEntity);
    const allLocation = await listEntity.delete({ locationId: In(locationIds) });
    return allLocation;
  };

  const deleteListLevelAnalysisId = async () => {
    const analysisEntity = connection.getRepository(Analyses);
    await analysisEntity.delete({ listId: listId });
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

  const insertListLevelAnalysis = async (analysis: Analyses) => {
    const analysisEntity = connection.getRepository(Analyses);
    analysisEntity.insert(analysis);
  };

  const insertListAnalysisStatus = async () => {
    const updateTime = new Date().toISOString().split('T')[0];
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
    getAllLocations,
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

export const mockAnalysisFlow = async ({
  organization_database,
  list_id,
  template_type = 'cocoa_generic',
}: MockAnalysisFlowType) => {
  const {
    connection,
    deleteAllLocationsAnalysis,
    deleteListLevelAnalysisId,
    getAllLocations,
    insertAllLocationAnalysis,
    insertListAnalysisStatus,
    insertListLevelAnalysis,
  } = await repository(organization_database, list_id);

  const queryRunner = connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const allLocations = await getAllLocations();

    if (allLocations.length > 0) {
      const locationsIds = allLocations.map((l) => l.locationId);
      await deleteAllLocationsAnalysis(locationsIds);
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
    await deleteListLevelAnalysisId();

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
