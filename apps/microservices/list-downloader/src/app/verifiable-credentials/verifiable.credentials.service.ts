import { Injectable, Logger } from '@nestjs/common';
import jsonld from 'jsonld';
import * as vc from '@digitalbazaar/vc';
import { Ed25519Signature2018 } from '@digitalbazaar/ed25519-signature-2018';
import { Ed25519VerificationKey2018 } from '@digitalbazaar/ed25519-verification-key-2018';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VerifiableCredentialService {
  public readonly logger = new Logger(VerifiableCredentialService.name);
  async signedVcOutput() {
    const issuanceDate = new Date().toISOString();
    const expirationDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString();
    this.logger.log('Singing Verifiable Credentials');
    try {
      const credential = {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://geojson.org/geojson-ld/geojson-context.jsonld',
          'https://pro.globalforestwatch.org/geojson-defreport.jsonld',
        ],
        id: `urn:uuid:${uuidv4()}`,
        type: ['VerifiableCredential'],
        issuer: 'https://pro.globalforestwatch.org/vc-issuer/1',
        issuanceDate: issuanceDate,
        expirationDate: expirationDate,
        credentialSubject: {
          geojson: 'geojson',
        },
      };
      const { LD_VC_KeyPair } = process.env;
      const keyPairJson = JSON.parse(atob(LD_VC_KeyPair));
      console.log('keyPairJson', keyPairJson);
      const suite = new Ed25519Signature2018({ key: keyPairJson });
      const signedVC = await vc.issue({
        credential,
        suite,
        documentLoader: jsonld.documentLoaders.node(),
      });
      return credential;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
