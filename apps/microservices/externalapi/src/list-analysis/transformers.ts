import { ExternalUpload } from '@wri-monorepos/sql';
import { PrepareUploadResponse } from './dtos';

export function transformExternalUpload(externalUpload: ExternalUpload): PrepareUploadResponse {
  return {
    uploadId: externalUpload.id.toString(),
    uploadUrl: externalUpload.uploadUrl,
    uploadDateTime: externalUpload.uploadDateTime,
  };
}

export function transformExternalUploads(
  externalUploads: ExternalUpload[]
): PrepareUploadResponse[] {
  return externalUploads.map(transformExternalUpload);
}
