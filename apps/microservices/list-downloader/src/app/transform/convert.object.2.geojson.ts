import { Transform } from 'stream';
import { parse, GeoJSONGeometryOrNull } from 'wellknown';
import { ClientStoreConnection, Lists, AFIAnalysis, ListsAnalysisStatus } from '@wri-monorepos/sql';
import { VerifiableCredentialService } from '../verifiable-credentials/verifiable.credentials.service';
import { Logger } from '@nestjs/common';
class ConvertObject2Geojson extends Transform {
  constructor() {
    super({ objectMode: true });
  }
  private readonly clientStoreConnection = new ClientStoreConnection();
  private readonly verifiableCredentialService = new VerifiableCredentialService();
  private readonly logger = new Logger(ConvertObject2Geojson.name);

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
    const listProperties = await listRepository.findOne({ where: { id: listId } });

    const afiRepository = await connection.getRepository(AFIAnalysis);
    const aFiAnalysis = await afiRepository.findOne({
      where: { list_id: listId, location_id },
    });

    const listAnalysisStatusRepository = await connection.getRepository(ListsAnalysisStatus);
    const { updateTime } = await listAnalysisStatusRepository.findOne({
      where: { listId: listId, analysisId: 'AFI' },
    });

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
      )
        .then((listProperties) => {
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
          this.verifiableCredentialService
            .signedVcOutput(afiProperties)
            .then((signedVC) => {
              feature.properties = { ...feature.properties, ...signedVC };
              geojson.features.push(feature);
              next(null, geojson);
            })
            .catch((err) => {
              this.logger.error(`Error on signedVcOutput: ${err}`);
              // Send the feature without a signed location
              feature.properties = { ...feature.properties, ...afiProperties };
              geojson.features.push(feature);
              next(null, geojson);
            });
        })
        .catch((err) => {
          this.logger.error(`Error on signedVcOutput: ${err}`);
        });
    } else {
      geojson.features.push(feature);
      next(null, geojson);
    }
  }
}

export { ConvertObject2Geojson };
