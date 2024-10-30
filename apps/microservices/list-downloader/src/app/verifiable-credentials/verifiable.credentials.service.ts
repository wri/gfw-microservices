import { Injectable, Logger } from '@nestjs/common';
import { securityLoader } from '@digitalcredentials/security-document-loader';
import * as vc from '@digitalcredentials/vc';
import { Ed25519Signature2020 } from '@digitalcredentials/ed25519-signature-2020';
import { v4 as uuidv4 } from 'uuid';
import { Ed25519VerificationKey2020 } from '@digitalcredentials/ed25519-verification-key-2020';
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
      // couldn't use this keypair from env variable
      const keyPairJson = JSON.parse(Buffer.from(LD_VC_KeyPair, 'base64').toString('utf-8'));
      console.log('keyPairJson', keyPairJson);
      const keyGenDetails = {
        id: 'https://pro.globalforestwatch.org/publicKey/1',
        controller: 'https://pro.globalforestwatch.org/vc-issuer/1',
      };
      const keyPair = await Ed25519VerificationKey2020.generate(keyGenDetails);
      console.log('keyPair', keyPair, keyPairJson);
      const suite = new Ed25519Signature2020({ key: keyPair });
      const signedVC = await vc.issue({
        credential,
        suite,
        documentLoader: securityLoader().build(),
      });
      return signedVC;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
