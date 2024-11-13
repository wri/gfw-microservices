export class GeoJsonGeometry {
    type: string;
    coordinates: number[][][];
  }
  
  export class GeoJsonProperties {
    Location_Name: string;
    Centroid_Country: string;
    Location_HA: number;
    SBTN_Natural_Forest_HA: number;
    SBTN_Natural_Forest_Loss_Post_2020_HA: number;
    JRC_Forest_HA: number;
    JRC_Forest_Loss_Post_2020_HA: number;
    Analysis_Time: string;
    GFWPro_Account: number;
    Use_Rights: string;
  }
  
  export class GeoJson {
    type: string;
    geometry: GeoJsonGeometry;
    properties: GeoJsonProperties;
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