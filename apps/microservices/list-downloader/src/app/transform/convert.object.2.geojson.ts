import { Transform } from 'stream';
import { parse, GeoJSONGeometryOrNull } from 'wellknown';
import { ClientStoreConnection, Lists, AFIAnalysis, ListsAnalysisStatus } from '@wri-monorepos/sql';
class ConvertObject2Geojson extends Transform {
  constructor() {
    super({ objectMode: true });
  }
  private readonly clientStoreConnection = new ClientStoreConnection();

  getGeoJSONGeometry(wktGeometry: string): GeoJSONGeometryOrNull {
    return parse(wktGeometry);
  }
  private async getLocationProperties(
    listId: number,
    organizationDatabase: string,
    location_id: number
  ) {
    const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
    const listRepository = await connection.getRepository(Lists);

    const listProperties = await listRepository
      .createQueryBuilder('list')
      .leftJoinAndMapOne(
        'list.afi',
        AFIAnalysis,
        'afi',
        'afi.list_id = list.id AND afi.location_id = :location_id',
        { location_id }
      )
      .where('list.id = :listId', { listId })
      .leftJoinAndMapOne(
        'list.updateTime',
        ListsAnalysisStatus,
        'las',
        'las.listId = list.id AND las.analysisId = :analysisId',
        { analysisId: 'AFI' }
      )
      .getOne();

    if (!listProperties) {
      throw new Error('List not found');
    }

    const aFiAnalysis = listProperties['afi'];
    const updateTime = listProperties['updateTime'].updateTime;
    const gfwProConnection = await this.clientStoreConnection.getConnection('gfwpro');
    const organizationIdQuery = `
        SELECT *
        FROM "Organizations"
        WHERE [organization_db] = '${organizationDatabase}'`;
    const organizationProperties = await gfwProConnection.query(organizationIdQuery);
    const organizationId = organizationProperties[0].id || null;
    return {
      ...listProperties,
      ...aFiAnalysis,
      updateTime,
      organizationId,
    };
  }
  _transform(location, _, next) {
    const geojson = {
      type: 'FeatureCollection',
      features: [],
    };

    if (!location) {
      next(null, geojson);
      return;
    }

    const feature = Object.keys(location).reduce(
      (obj, key) => {
        if (key === 'WKTGeometry') {
          obj.geometry = this.getGeoJSONGeometry(location[key]);
        } else {
          obj.properties[key] = location[key] ? location[key].toString() : '';
        }
        return obj;
      },
      {
        type: 'Feature',
        properties: {},
        geometry: {},
      }
    );
    if (feature.properties['organizationDatabase']) {
      this.getLocationProperties(
        location.list_id,
        location.organizationDatabase,
        feature.properties['location_id']
      ).then((listProperties) => {
        const afiProperties = {
          Centroid_Country: feature.properties['Country'],
          Location_HA: listProperties.total_area_ha,
          SBTN_Natural_Forest_HA: listProperties.natural_land_area,
          SBTN_Natural_Forest_Loss_Post_2020_HA: listProperties.natural_land_deforested_area,
          JRC_Forest_HA: listProperties.jrc_land_area,
          JRC_Forest_Loss_Post_2020_HA: listProperties.jrc_land_deforested_area,
          Analysis_Time: listProperties.updateTime,
          GFWPro_Account: listProperties.organizationId,
          Use_Rights: 'Full Sharing',
        };

        delete feature.properties['list_id'];
        delete feature.properties['organizationDatabase'];
        delete feature.properties['Country'];
        delete feature.properties['location_id'];
        feature.properties = { ...feature.properties, ...afiProperties };
        geojson.features.push(feature);
        next(null, geojson);
      });
    } else {
      geojson.features.push(feature);
      next(null, geojson);
    }
  }
}

export { ConvertObject2Geojson };
