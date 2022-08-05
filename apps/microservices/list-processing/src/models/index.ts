export interface RequestPreSignedURLModel {
  key: string;
  contentType: string;
  replaceFile?: boolean;
}

export interface RequestSaveLargeListProcessModel {
  key: string;
  userId: number;
  listName: string;
}

export interface ResponsePreSignedURLModel {
  url: string;
  keyFile: string;
}

export interface ResponseObjectPresignedURLModel {
  url: string;
}
