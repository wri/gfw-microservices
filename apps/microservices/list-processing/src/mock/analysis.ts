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

//TODO avoid creating a lot of connections
const repository = () => {
  const clientStoreConnection = new ClientStoreConnection();

  const getAllLocations = async (organizationDatabase: string, listTableName: string) => {
    const ListEntity = new EntitySchema<ListSchemaType>({
      ...ListSchema,
      name: listTableName,
    });
    const connection = await clientStoreConnection.getConnection(organizationDatabase, [
      ListEntity,
    ]);
    const listEntity = connection.getRepository(ListEntity);
    const allLocation = await listEntity.find();
    return allLocation;
  };

  const getAllLocationAnalysis = async (
    organizationDatabase: string,
    listAnalysisTableName: string
  ) => {
    const AnalysisEntity = new EntitySchema<AnalysisSchemaType>({
      ...AnalysisSchema,
      name: listAnalysisTableName,
    });
    const connection = await clientStoreConnection.getConnection(organizationDatabase, [
      AnalysisEntity,
    ]);
    const listEntity = connection.getRepository(AnalysisEntity);
    const allLocation = await listEntity.find();
    return allLocation;
  };

  const deleteAllLocationsAnalysis = async (
    organizationDatabase: string,
    listAnalysisTableName: string,
    analysisIds: Array<number>
  ) => {
    const AnalysisEntity = new EntitySchema<AnalysisSchemaType>({
      ...AnalysisSchema,
      name: listAnalysisTableName,
    });
    const connection = await clientStoreConnection.getConnection(organizationDatabase, [
      AnalysisEntity,
    ]);
    const listEntity = connection.getRepository(AnalysisEntity);
    const allLocation = await listEntity.delete({ id: In(analysisIds) });
    return allLocation;
  };

  const getAnalysisAndListTableName = async (organizationDatabase: string, listId: number) => {
    const connection = await clientStoreConnection.getConnection(organizationDatabase, [List]);
    const listRepository = connection.getRepository(List);
    const { listAnalysisTableName, listTableName } = (await listRepository.findOne({
      where: { id: listId },
    })) ?? {
      listAnalysisTableName: undefined,
      listTableName: undefined,
    };
    return {
      listAnalysisTableName,
      listTableName,
    };
  };

  const getListLevelAnalysisId = async (organizationDatabase: string, listId: number) => {
    const connection = await clientStoreConnection.getConnection(organizationDatabase, [Analysis]);
    const analysisRepository = connection.getRepository(Analysis);
    const { id } = (await analysisRepository.findOne({ where: { listId: listId } })) ?? {
      id: undefined,
    };
    return id;
  };

  const deleteListLevelAnalysisId = async (organizationDatabase: string, analysisId: number) => {
    const connection = await clientStoreConnection.getConnection(organizationDatabase, [Analysis]);
    const analysisEntity = connection.getRepository(Analysis);
    await analysisEntity.delete({ id: analysisId });
  };

  const insertAllLocationAnalysis = async (
    organizationDatabase: string,
    listAnalysisTableName: string,
    locationLevelAnalysisData: Array<AnalysisSchemaType>
  ) => {
    const AnalysisEntity = new EntitySchema<AnalysisSchemaType>({
      ...AnalysisSchema,
      name: listAnalysisTableName,
    });
    const connection = await clientStoreConnection.getConnection(organizationDatabase, [
      AnalysisEntity,
    ]);
    await connection
      .createQueryBuilder()
      .insert()
      .into(AnalysisEntity)
      .values(locationLevelAnalysisData)
      .execute();
  };

  const insertListLevelAnalysis = async (organizationDatabase: string, analysis: Analysis) => {
    const connection = await clientStoreConnection.getConnection(organizationDatabase, [Analysis]);
    const analysisEntity = connection.getRepository(Analysis);
    analysisEntity.insert(analysis);
  };

  const insertListAnalysisStatus = async (organizationDatabase: string, listId: number) => {
    const connection = await clientStoreConnection.getConnection(organizationDatabase, [
      ListsAnalysisStatus,
    ]);
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
          updateTime: moment().format('YYYY-MM-DD'),
        }
      );
    }
    listsAnalysisStatusRepository.insert({
      listId,
      analysisId: 'FCD',
      updateTime: moment().format('YYYY-MM-DD'),
    });
  };

  return {
    deleteAllLocationsAnalysis,
    deleteListLevelAnalysisId,
    getAllLocationAnalysis,
    getAllLocations,
    getAnalysisAndListTableName,
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
  const { listAnalysisTableName, listTableName } = await repository().getAnalysisAndListTableName(
    organization_database,
    list_id
  );
  const allLocations = await repository().getAllLocations(organization_database, listTableName);
  const allLocationAnalysis = await repository().getAllLocationAnalysis(
    organization_database,
    listAnalysisTableName
  );

  if (allLocationAnalysis.length > 0) {
    const analysisIds = allLocationAnalysis.map((l) => l.id);
    await repository().deleteAllLocationsAnalysis(
      organization_database,
      listAnalysisTableName,
      analysisIds
    );
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

  await repository().insertAllLocationAnalysis(
    organization_database,
    listAnalysisTableName,
    newLocationLevelAnalysisData
  );
  const analysisId = await repository().getListLevelAnalysisId(organization_database, list_id);
  if (analysisId) {
    await repository().deleteListLevelAnalysisId(organization_database, analysisId);
  }

  const newListLevelAnalysis = {
    ...mockedListAnalysis,
    listId: list_id,
  };
  await repository().insertListLevelAnalysis(organization_database, newListLevelAnalysis);
  await repository().insertListAnalysisStatus(organization_database, list_id);
};
