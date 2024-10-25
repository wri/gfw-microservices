import * as logger from '../../../config/privateutils/logger.utils';

/**
 * @name exports
 * @static
 * @summary verifiableCredentials page routes
 */
export = (app, limiter) => {
  /**
   * @name /verifiableCredentials
   * @see verifiableCredentials.controller
   * @memberof Router
   */

  const runGetPublicKey = async (request, response) => {
    const { LD_VC_KeyPair } = process.env;
    const envPublicKey = btoa(JSON.stringify(LD_VC_KeyPair));
    const publicKey = {
      id: 'https://pro.globalforestwatch.org/publicKey/1',
      type: 'Ed25519VerificationKey2018',
      controller: 'https://pro.globalforestwatch.org/vc-issuer/1',
      publicKeyBase58: '6LxDcwoRGAL9qHcaYicZe7QdsWPJ4kpX25oesratuhnA',
    };
    return response.status(200).send(publicKey);
  };

  const getVcIssuer = async (request, response) => {
    logger.info('GET //vc-issuer/1');
    const jsonVcContent = {
      id: 'https://pro.globalforestwatch.org/vc-issuer/1',
      '@context': 'https://www.w3.org/ns/did/v1',
      assertionMethod: 'https://pro.globalforestwatch.org/publicKey/1',
    };
    return response.status(200).send({ jsonVcContent });
  };
  const getGeoJsonDefReport = async (request, response) => {
    const geoJsonDefReport = {
      ['@context']: {
        ['@version']: 1.1,
        geojson: 'https://purl.org/geojson/vocab#',
        Location_Name: 'geojson:Location_Name',
        Centroid_Country: 'geojson:Centroid_Country',
        Location_HA: 'geojson:Location_HA',
        SBTN_Natural_Forest_HA: 'geojson:SBTN_Natural_Forest_HA',
        SBTN_Natural_Forest_Loss_Post_2020_HA: 'geojson:SBTN_Natural_Forest_Loss_Post_2020_HA',
        JRC_Forest_HA: 'geojson:JRC_Forest_HA',
        JRC_Forest_Loss_Post_2020_HA: 'geojson:JRC_Forest_Loss_Post_2020_HA',
        Analysis_Time: 'geojson:Analysis_time',
        GFWPro_Account: 'geojson:GFWPro_Account',
        Use_Rights: 'geojson:Use_Rights',
      },
    };
    return response.status(200).send({ geoJsonDefReport });
  };
  app.get('/geojson-defreport.jsonld', [getGeoJsonDefReport]);
  app.get(`/publicKey/1`, [runGetPublicKey]);
  app.get(`/vc-issuer/1`, [getVcIssuer]);
};
