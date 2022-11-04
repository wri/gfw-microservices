export interface ResponsePreSignedURLModel {
  url: string;
  keyFile: string;
  fileS3Route: string;
}

export interface ResponseObjectPresignedURLModel {
  url: string;
}
