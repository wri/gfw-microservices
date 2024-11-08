import * as logger from '../../../config/privateutils/logger.utils';
import middlewares from '../../../config/publicutils/middlewares';
import rateLimiterUtil from '../../../config/lib/limiter-util';
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

  const routeMiddlewares = [];
  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitUnauthenticated));
  }
  function getEnvironmentBaseUrls() {
    const { NODE_ENV } = process.env;
    let baseUrl;
    if (NODE_ENV === 'ProdV2') {
      baseUrl = 'https://pro.globalforestwatch.org';
    } else if (NODE_ENV === 'staging') {
      baseUrl = 'https://pro-staging.globalforestwatch.org';
    } else if (NODE_ENV === 'qa') {
      baseUrl = 'https://pro-qa.globalforestwatch.org';
    } else {
      baseUrl = 'https://localhost:8443';
    }
    return baseUrl;
  }

  const getPublicKey = async (request, response) => {
    logger.info('GET /publicKey/1');
    const { LD_VC_KeyPair } = process.env;
    if (!LD_VC_KeyPair) {
      return response.status(500).send('Public key not found!');
    }
    const envKeyPair = JSON.parse(atob(LD_VC_KeyPair));

    if (Object.entries(envKeyPair).length < 5) {
      console.log('Public key not found!');
    }
    const envPublicKey = envKeyPair['publicKeyBase58'];

    //ensure that there is no private key in the public key
    if (!envPublicKey || envPublicKey.includes('privateKeyBase58')) {
      return response.status(500).send('Public key not found!');
    }
    const BASE_URL = getEnvironmentBaseUrls();

    const publicKey = {
      id: `${BASE_URL}/publicKey/1`,
      type: 'Ed25519VerificationKey2018',
      controller: `${BASE_URL}/vc-issuer/1`,
      publicKeyBase58: envPublicKey,
    };
    return response.status(200).send(publicKey);
  };

  const getVcIssuer = async (request, response) => {
    logger.info('GET /vc-issuer/1');
    const BASE_URL = getEnvironmentBaseUrls();
    const jsonVcContent = {
      id: `${BASE_URL}/vc-issuer/1`,
      '@context': 'https://www.w3.org/ns/did/v1',
      assertionMethod: `${BASE_URL}/publicKey/1`,
    };
    return response.status(200).send(jsonVcContent);
  };

  const getGeoJsonDefReport = async (request, response) => {
    logger.info('GET /geojson-defreport.jsonld');
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
        Analysis_Time: 'geojson:Analysis_Time',
        GFWPro_Account: 'geojson:GFWPro_Account',
        Use_Rights: 'geojson:Use_Rights',
      },
    };
    return response.status(200).send(geoJsonDefReport);
  };

  app.get('/geojson-defreport.jsonld', [...routeMiddlewares, getGeoJsonDefReport]);

  app.get(`/publicKey/1`, [...routeMiddlewares, getPublicKey]);

  app.get(`/vc-issuer/1`, [...routeMiddlewares, getVcIssuer]);
};
