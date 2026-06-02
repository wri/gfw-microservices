import { Injectable, Logger } from '@nestjs/common';
import * as jsonld from 'jsonld';
import { randomUUID } from 'crypto';
import { GeoJson } from './types/verifiable-credential.model';
import * as cache from 'memory-cache';
let vc, Ed25519Signature2018, Ed25519VerificationKey2018;
const shouldLoadDynamicModules = process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID;
// hack to avoid importing in test because jest does not like dynamic import
if (shouldLoadDynamicModules) {
  eval("import('@digitalbazaar/vc').then(x=>vc=x)");
  eval(
    "import('@digitalbazaar/ed25519-signature-2018').then(x=>Ed25519Signature2018=x.Ed25519Signature2018)"
  );
  eval(
    "import('@digitalbazaar/ed25519-verification-key-2018').then(x=>Ed25519VerificationKey2018=x.Ed25519VerificationKey2018)"
  );
}

@Injectable()
export class VerifiableCredentialService {
  public readonly logger = new Logger(VerifiableCredentialService.name);
  async signedVcOutput(geojson: GeoJson) {
    this.logger.log('Signing Verifiable Credentials');
    const issuanceDate = new Date().toISOString();
    const expirationDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString();
    const BASE_URL = this.getEnvironmentBaseUrl();
    try {
      const credential = {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://geojson.org/geojson-ld/geojson-context.jsonld',
          `${BASE_URL}/geojson-defreport.jsonld`,
        ],
        id: `urn:uuid:${randomUUID()}`,
        type: ['VerifiableCredential'],
        issuer: `${BASE_URL}/vc-issuer/1`,
        issuanceDate: issuanceDate,
        expirationDate: expirationDate,
        credentialSubject: {
          geojson: geojson,
        },
      };
      const { LD_VC_KeyPair } = process.env;
      const keyPairJson = JSON.parse(Buffer.from(LD_VC_KeyPair, 'base64').toString('utf-8'));
      const key = await Ed25519VerificationKey2018.from(keyPairJson);
      const suite = new Ed25519Signature2018({ key: key });
      const customLoader =
        process.env.NODE_ENV === 'development'
          ? jsonld.documentLoaders.node({ strictSSL: false, safe: false })
          : jsonld.documentLoaders.node();

      const combinedDocumentLoader = async (url) => {
        const cachedDocument = cache.get(url);
        if (cachedDocument) {
          return cachedDocument;
        }
        const nonCachedResult = await customLoader(url);
        cache.put(url, nonCachedResult, 1000 * 60 * 60); // Cache about 1 hour
        return nonCachedResult;
      };

      const signedVC = await vc.issue({
        credential,
        suite,
        documentLoader: combinedDocumentLoader,
      });
      return signedVC;
    } catch (error) {
      this.logger.error(
        `VC signing failed message=${error.message} code=${error.details?.code} url=${error.details?.url} cause=${error.details?.cause?.message} causeCode=${error.details?.cause?.details?.code} causeStatus=${error.details?.cause?.details?.httpStatusCode}`
      );
      throw error.message;
    }
  }
  private getEnvironmentBaseUrl() {
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
}
