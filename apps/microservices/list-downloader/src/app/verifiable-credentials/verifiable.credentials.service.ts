import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class VerifiableCredentialService {
  public readonly logger = new Logger(VerifiableCredentialService.name);
  async signedVcOutput() {
    this.logger.log('Singing Verifiable Credentials');
    try {
      const credential = {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://geojson.org/geojson-ld/geojson-context.jsonld',
          'https://pro.globalforestwatch.org/geojson-defreport.jsonld',
        ],
        id: 'urn:uuid:8c469bf9-472f-4f9d-922c-89b3ec83c8d7',
        type: ['VerifiableCredential'],
        issuer: 'https://pro.globalforestwatch.org/vc-issuer/1',
        issuanceDate: '2024-09-18T12:34:56Z',
        expirationDate: '2025-09-18T12:34:56Z',
        credentialSubject: {
          geojson: 'geojson',
        },
      };
      return credential;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
