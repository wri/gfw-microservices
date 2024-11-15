import {
  VerifiableCredential,
  CredentialSubject,
  GeoJson,
  GeoJsonGeometry,
  GeoJsonProperties,
  Proof,
} from './verifiable-credential.model';

function convertToVerifiableCredential(data: any): VerifiableCredential {
  const credential = new VerifiableCredential();
  credential['@context'] = data.properties['@context'];
  credential.id = data.properties.id;
  credential.type = data.properties.type;
  credential.issuer = data.properties.issuer;
  credential.issuanceDate = data.properties.issuanceDate;
  credential.expirationDate = data.properties.expirationDate;

  const geojson = new GeoJson();
  geojson.type = data.type;

  const geometry = new GeoJsonGeometry();
  geometry.type = data.geometry.type;
  geometry.coordinates = data.geometry.coordinates;
  geojson.geometry = geometry;

  const properties = new GeoJsonProperties();
  properties.Location_Name = data.properties.Location_Name;
  properties.Centroid_Country = data.properties.credentialSubject.geojson.Centroid_Country;
  properties.Location_HA = data.properties.credentialSubject.geojson.Location_HA;
  properties.SBTN_Natural_Forest_HA =
    data.properties.credentialSubject.geojson.SBTN_Natural_Forest_HA;
  properties.SBTN_Natural_Forest_Loss_Post_2020_HA =
    data.properties.credentialSubject.geojson.SBTN_Natural_Forest_Loss_Post_2020_HA;
  properties.JRC_Forest_HA = data.properties.credentialSubject.geojson.JRC_Forest_HA;
  properties.JRC_Forest_Loss_Post_2020_HA =
    data.properties.credentialSubject.geojson.JRC_Forest_Loss_Post_2020_HA;
  properties.Analysis_Time = data.properties.credentialSubject.geojson.Analysis_Time;
  properties.GFWPro_Account = data.properties.credentialSubject.geojson.GFWPro_Account;
  properties.Use_Rights = data.properties.credentialSubject.geojson.Use_Rights;
  geojson.properties = properties;

  const credentialSubject = new CredentialSubject();
  credentialSubject.geojson = geojson;
  credential.credentialSubject = credentialSubject;

  const proof = new Proof();
  proof.type = data.properties.proof.type;
  proof.created = data.properties.proof.created;
  proof.verificationMethod = data.properties.proof.verificationMethod;
  proof.proofPurpose = data.properties.proof.proofPurpose;
  proof.jws = data.properties.proof.jws;
  credential.proof = proof;

  return credential;
}
