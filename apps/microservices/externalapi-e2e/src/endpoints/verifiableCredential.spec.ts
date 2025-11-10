import axios from 'axios';
import { postRedirectHeaders } from '../support/utils';
import AdmZip from 'adm-zip';
import * as jsonld from 'jsonld';
import * as cache from 'memory-cache';

const BASE_URL = process.env.HOST;
const API_TOKEN = process.env.API_TOKEN;
const email = process.env.USER_EMAIL;
const list = process.env.TEST_LIST;

interface ApiResponse {
  status: string;
  listId?: string;
  resultUrl?: string;
}

interface PollResult {
  apiResponse: ApiResponse;
  verifiableCredential: any;
}

async function pollApiUntilComplete(
  url: string,
  options = {},
  pollIntervalMs = 1000,
  timeoutMs = 10000
): Promise<PollResult> {
  const startTime = Date.now();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error('Polling timeout: API did not complete within the specified time');
    }

    try {
      const response = await fetch(url, { ...options, redirect: 'follow' });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Status API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const result: ApiResponse = await response.json();

      if (result.status === 'Completed') {
        if (!result.resultUrl || !/^https?:\/\//.test(result.resultUrl)) {
          console.error('Invalid resultUrl:', result.resultUrl);
          throw new Error(`Invalid or missing resultUrl: ${result.resultUrl}`);
        }

        const zipResponse = await fetch(result.resultUrl, {
          headers: {
            'x-api-key': process.env.API_TOKEN,
          },
        });

        if (!zipResponse.ok) {
          const errorText = await zipResponse.text();
          console.error('Zip download failed:', {
            status: zipResponse.status,
            contentType: zipResponse.headers.get('Content-Type'),
            body: errorText,
          });
          throw new Error(`Failed to download zip file: ${zipResponse.status} ${errorText}`);
        }

        const contentType = zipResponse.headers.get('Content-Type') || 'unknown';
        if (
          !contentType.includes('application/zip') &&
          !contentType.includes('application/octet-stream')
        ) {
          const errorText = await zipResponse.text();
          console.error('Invalid zip content type:', { contentType, body: errorText });
          throw new Error(
            `Invalid content type: ${contentType}. Expected application/zip or application/octet-stream`
          );
        }

        const arrayBuffer = await zipResponse.arrayBuffer();

        if (arrayBuffer.byteLength === 0) {
          throw new Error('Downloaded zip file is empty');
        }

        try {
          const zip = new AdmZip(Buffer.from(arrayBuffer));
          const zipEntries = zip.getEntries();

          // Find the JSON file containing the verifiable credential
          const jsonEntry = zipEntries.find((entry) => entry.entryName.endsWith('.json'));

          if (!jsonEntry) {
            throw new Error('No JSON file found in ZIP');
          }

          const jsonContent = jsonEntry.getData().toString('utf8');
          const verifiableCredential = JSON.parse(jsonContent);

          return {
            apiResponse: result,
            verifiableCredential,
          };
        } catch (zipError) {
          console.error('Zip processing error:', {
            url: result.resultUrl,
            message: zipError instanceof Error ? zipError.message : zipError,
            stack: zipError instanceof Error ? zipError.stack : undefined,
          });
          throw new Error(
            `Failed to process zip file: ${
              zipError instanceof Error ? zipError.message : 'Unknown error'
            }`
          );
        }
      } else if (result.status === 'Failed') {
        console.error('API status failed:', result);
        throw new Error('API request failed');
      }

      console.log('Polling again in', pollIntervalMs, 'ms...');
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    } catch (error) {
      console.error('Fetch error in pollApiUntilComplete:', {
        url,
        message: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}

describe('Verifiable Credential Verification', () => {
  let publicKey: any;
  let verifiableCredential: any;

  it(
    'should retrieve the public key',
    async () => {
      try {
        const res = await axios.get(`${BASE_URL}/publicKey/1`, {
          headers: {
            'x-api-key': API_TOKEN,
          },
        });
        publicKey = res.data;
        expect(res.status).toBe(200);
        expect(publicKey).toBeDefined();
        expect(publicKey.publicKeyBase58).toBeDefined();
        expect(publicKey.type).toBe('Ed25519VerificationKey2018');
        expect(publicKey.controller).toBeDefined();
        console.log('Retrieved public key:', publicKey.id);
      } catch (error) {
        console.error('Issue retrieving public key', error.stack || error, error?.response?.data);
        throw error;
      }
    },
    30 * 1000
  );

  it(
    'should generate DefReport analysis with Verifiable Credential output',
    async () => {
      try {
        const res = await postRedirectHeaders(
          `${BASE_URL}/api/v1/list/${list}/analysis/DefReport/generate`,
          {
            userEmail: email,
            outputType: 'verifiableCredential',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': API_TOKEN,
            },
          }
        );

        expect(res.status).toBe(201);
        expect(res.data).toBe('');
        console.log('DefReport analysis generation initiated');
      } catch (error) {
        console.error(
          'Error generating DefReport analysis',
          error.stack || error,
          error?.response?.data
        );
        throw error;
      }
    },
    30 * 1000
  );

  it(
    'should download and extract the Verifiable Credential from the analysis result',
    async () => {
      try {
        const { apiResponse, verifiableCredential: vc } = await pollApiUntilComplete(
          `${BASE_URL}/api/v1/list/${list}/analysis/DefReport/status`,
          {
            method: 'GET',
            headers: {
              'x-api-key': API_TOKEN,
            },
          },
          2000, // Poll every 2 seconds
          60000 // Timeout after 60 seconds
        );

        expect(apiResponse.status).toBe('Completed');
        expect(apiResponse.listId).toBe(list);

        // Store the VC for the verification test
        verifiableCredential = vc;

        // Validate VC structure
        expect(verifiableCredential).toBeDefined();
        expect(verifiableCredential['@context']).toBeDefined();
        expect(verifiableCredential.type).toContain('VerifiableCredential');
        expect(verifiableCredential.credentialSubject).toBeDefined();
        expect(verifiableCredential.proof).toBeDefined();
        expect(verifiableCredential.proof.type).toBe('Ed25519Signature2018');
        expect(verifiableCredential.proof.jws).toBeDefined();

        console.log('Successfully extracted Verifiable Credential');
        console.log('VC ID:', verifiableCredential.id);
        console.log('VC Proof type:', verifiableCredential.proof.type);
      } catch (error) {
        console.error('Polling or extraction failed:', error);
        throw error;
      }
    },
    60 * 1000
  );

  it(
    'should verify the Verifiable Credential signature using the public key',
    async () => {
      try {
        // Dynamically import the verification libraries (ESM modules)
        // @ts-expect-error - ESM module without TypeScript declarations
        const { verifyCredential } = await import('@digitalbazaar/vc');
        // @ts-expect-error - ESM module without TypeScript declarations
        const { Ed25519Signature2018 } = await import('@digitalbazaar/ed25519-signature-2018');
        // @ts-expect-error - ESM module without TypeScript declarations
        const { Ed25519VerificationKey2018 } = await import('@digitalbazaar/ed25519-verification-key-2018');

        // Ensure we have both the public key and the verifiable credential
        expect(publicKey).toBeDefined();
        expect(verifiableCredential).toBeDefined();

        // Create the verification key from the public key retrieved from the API
        const key = await Ed25519VerificationKey2018.from({
          id: publicKey.id,
          type: publicKey.type,
          controller: publicKey.controller,
          publicKeyBase58: publicKey.publicKeyBase58,
        });

        // Create the verification suite
        const suite = new Ed25519Signature2018({
          key,
        });

        // Set up document loader for resolving contexts
        const customLoader = jsonld.documentLoaders.node({ strictSSL: false, safe: false });

        const combinedDocumentLoader = async (url: string) => {
          const cachedDocument = cache.get(url);
          if (cachedDocument) {
            return cachedDocument;
          }
          const nonCachedResult = await customLoader(url);
          cache.put(url, nonCachedResult, 1000 * 60 * 60); // Cache about 1 hour
          return nonCachedResult;
        };

        // Verify the credential
        const result = await verifyCredential({
          credential: verifiableCredential,
          suite,
          documentLoader: combinedDocumentLoader,
        });

        // Check verification results
        expect(result).toBeDefined();
        expect(result.verified).toBe(true);

        // Log detailed verification results
        console.log('Verification successful!');
        console.log('Verified:', result.verified);

        if (result.results && result.results.length > 0) {
          console.log(
            'Proof verification results:',
            result.results.map((r: any) => ({
              verified: r.verified,
              proof: r.proof?.type,
            }))
          );
        }

        if (!result.verified) {
          console.error('Verification failed!');
          console.error('Verification error:', result.error);
          if (result.results) {
            result.results.forEach((r: any, index: number) => {
              if (r.error) {
                console.error(`Result ${index} error:`, r.error);
              }
            });
          }
        }

        // Ensure there are no verification errors
        expect(result.error).toBeUndefined();
      } catch (error) {
        console.error('Verification failed with error:', error);
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
        throw error;
      }
    },
    30 * 1000
  );
});
