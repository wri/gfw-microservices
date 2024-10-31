import { Injectable, Logger } from '@nestjs/common';
import jsonld from 'jsonld';
import { v4 as uuidv4 } from 'uuid';
let vc, Ed25519Signature2018, Ed25519VerificationKey2018;
eval("import('@digitalbazaar/vc').then(x=>vc=x)");
eval(
  "import('@digitalbazaar/ed25519-signature-2018').then(x=>Ed25519Signature2018=x.Ed25519Signature2018)"
);
eval(
  "import('@digitalbazaar/ed25519-verification-key-2018').then(x=>Ed25519VerificationKey2018=x.Ed25519VerificationKey2018)"
);

@Injectable()
export class VerifiableCredentialService {
  public readonly logger = new Logger(VerifiableCredentialService.name);
  async signedVcOutput() {
    const issuanceDate = new Date().toISOString();
    const expirationDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString();
    this.logger.log('Singing Verifiable Credentials');
    const BASE_URL = this.getEnvironmentBaseUrl();
    try {
      const credential = {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://geojson.org/geojson-ld/geojson-context.jsonld',
          `${BASE_URL}/geojson-defreport.jsonld`,
        ],
        id: `urn:uuid:${uuidv4()}`,
        type: ['VerifiableCredential'],
        issuer: `${BASE_URL}/vc-issuer/1`,
        issuanceDate: issuanceDate,
        expirationDate: expirationDate,
        credentialSubject: {
          geojson: 'geojson',
        },
      };
      const { LD_VC_KeyPair } = process.env;
      const keyPairJson = JSON.parse(Buffer.from(LD_VC_KeyPair, 'base64').toString('utf-8'));
      console.log('keyPairJson', keyPairJson);
      const key = await Ed25519VerificationKey2018.from(keyPairJson);
      const suite = new Ed25519Signature2018({ key: key });
      const customLoader =
        process.env.NODE_ENV === 'development'
          ? jsonld.documentLoaders.node({ strictSSL: false })
          : jsonld.documentLoaders.node();

      console.log('suite', suite, 'credential', credential, 'loader', customLoader);
      const signedVC = await vc.issue({
        credential,
        suite,
        documentLoader: customLoader,
      });
      return signedVC;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
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
