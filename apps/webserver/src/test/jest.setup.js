/* eslint-disable @typescript-eslint/ban-ts-comment */
import jsdom from 'jest-environment-jsdom';
import renderer from 'react-test-renderer';
import { jest } from '@jest/globals';
import { randomUUID } from 'crypto';

// Polyfill TextEncoder/Decoder for Node test environment (needed by supertest deps)
if (typeof global.TextEncoder === 'undefined') {
  const util = require('util');
  // @ts-ignore
  global.TextEncoder = util.TextEncoder;
  // @ts-ignore
  global.TextDecoder = util.TextDecoder;
}

const isClient = !!global.window;

if (isClient) {
  if (!global.crypto) {
    global.crypto = {
      subtle: undefined,
      getRandomValues: () => {
        throw new Error('getRandomValues is not implemented in this test environment');
      },
      randomUUID,
    };
  }
  if (!global.crypto.randomUUID) {
    global.crypto.randomUUID = randomUUID;
  }
  global.renderer = renderer;
  global.jsdom = jsdom;
  // @ts-ignore
  global.location = {};
  // @ts-ignore
  global.document = {};

  global.Transifex = {
    live: {
      translateText: (text) => {
        return text;
      },
      onReady: jest.fn(() => Promise.resolve({})),
    },
  };

  global.window = Object.create(window);
  const url = 'http://localhost';
  Object.defineProperty(window, 'location', {
    value: {
      href: url,
    },
    writable: true,
  });

  Object.defineProperty(window, 'listStatuses', {
    value: [],
    writable: true,
  });

  jest.mock('@sanity/client', () => {
    return function sanity() {
      return {
        fetch: () =>
          Promise.resolve([
            {
              description: [
                {
                  _key: 'e2502178c055',
                  _type: 'block',
                  children: [
                    {
                      marks: [],
                      text: 'Classification 1',
                    },
                  ],
                  markDefs: [],
                  style: 'normal',
                },
              ],
              icon: {
                _type: 'iconPicker',
                name: 'update',
                provider: 'mdi',
              },
              image: null,
              releaseDate: '2022-04-07',
              title: 'Palm Risk 2020 update now available',
            },
          ]),
      };
    };
  });
} else {
  // isServer
  jest.mock('sqs-consumer', () => {
    return {
      Consumer: {
        create: () => ({
          on: () => ({}),
          start: () => ({}),
        }),
      },
    };
  });
}
