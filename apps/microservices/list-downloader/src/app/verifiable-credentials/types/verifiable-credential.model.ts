import { GeoJsonSchema } from './geojson.schema'

export class GeoJsonGeometry {
    type: string;
    coordinates: number[][][];
  }
  
  export class GeoJson {
    type: string;
    geometry: GeoJsonGeometry;
    properties: GeoJsonSchema;
  }
  
  export class CredentialSubject {
    geojson: GeoJson;
  }
  
  export class Proof {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    jws: string;
  }
  
  export class VerifiableCredential {
    '@context': string[];
    id: string;
    type: string[];
    issuer: string;
    issuanceDate: string;
    expirationDate: string;
    credentialSubject: CredentialSubject;
    proof: Proof;
  }