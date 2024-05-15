import { SafeParseError, SafeParseSuccess, z } from 'zod';
import { allowedContentTypes } from './presigned.url.schema.validator';

// Define a Zod schema for the request body
const RequestPreSignedURLSchema = z.object({
  key: z.string(),
  contentType: z.enum(allowedContentTypes),
  replaceFile: z.boolean().optional(),
});

// Example request body
interface RequestPreSignedURLModel {
  key: string;
  contentType: string;
  replaceFile?: boolean;
}

describe('RequestPreSignedURLSchema', () => {
  it('should validate a valid request body', () => {
    const validRequestBody: RequestPreSignedURLModel = {
      key: 'example.zip',
      contentType: 'application/zip',
      replaceFile: true,
    };

    const validationResult = RequestPreSignedURLSchema.safeParse(
      validRequestBody
    ) as SafeParseSuccess<RequestPreSignedURLModel>;

    expect(validationResult.success).toBe(true);

    expect(validationResult.data).toEqual(validRequestBody);

    expect(RequestPreSignedURLSchema.parse(validRequestBody)).toEqual(validRequestBody);
  });

  it('should invalidate a request body with an invalid content type', () => {
    const invalidContentTypeRequestBody: RequestPreSignedURLModel = {
      key: 'example.zip',
      contentType: 'invalid/contentType',
      replaceFile: true,
    };

    const validationResult = RequestPreSignedURLSchema.safeParse(
      invalidContentTypeRequestBody
    ) as SafeParseError<RequestPreSignedURLModel>;

    expect(validationResult.success).toBe(false);
    expect(validationResult.error.errors[0].path).toEqual(['contentType']);
  });

  it('should invalidate a request body with missing required properties', () => {
    const missingKeyRequestBody: RequestPreSignedURLModel = {
      contentType: 'application/zip',
      replaceFile: true,
      key: undefined,
    };

    const validationResult = RequestPreSignedURLSchema.safeParse(
      missingKeyRequestBody
    ) as SafeParseError<RequestPreSignedURLModel>;

    expect(validationResult.success).toBe(false);
    expect(validationResult.error.errors[0].path).toEqual(['key']);
  });

  it('should allow a request body without replaceFile property', () => {
    const requestBodyWithoutReplaceFile: RequestPreSignedURLModel = {
      key: 'example.zip',
      contentType: 'application/zip',
    };

    const validationResult = RequestPreSignedURLSchema.safeParse(
      requestBodyWithoutReplaceFile
    ) as SafeParseSuccess<RequestPreSignedURLModel>;

    expect(validationResult.success).toBe(true);
    expect(validationResult.data).toEqual(requestBodyWithoutReplaceFile);
  });

  [
    'text/csv',
    'application/x-zip-compressed',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ].forEach((eapiContentType) => {
    it(`should allow contentType ${eapiContentType} from EAPI prepare_upload`, () => {
      const requestBody: RequestPreSignedURLModel = {
        key: 'example.zip',
        contentType: eapiContentType,
      };

      const validationResult = RequestPreSignedURLSchema.safeParse(
        requestBody
      ) as SafeParseSuccess<RequestPreSignedURLModel>;

      expect(validationResult.success).toBe(true);
      expect(validationResult.data).toEqual(requestBody);
    });
  });
});
