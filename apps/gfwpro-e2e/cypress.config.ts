import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nrwl/cypress/plugins/cypress-preset';
import * as webpack from '@cypress/webpack-preprocessor';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';

async function setupNodeEvents(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
): Promise<Cypress.PluginConfigOptions> {
  await addCucumberPreprocessorPlugin(on, config);
  console.log('ENVIRONMENT', process.env.CYPRESS_ENV);
  on(
    'file:preprocessor',
    webpack({
      webpackOptions: {
        resolve: {
          extensions: ['.ts', '.js'],
        },
        module: {
          rules: [
            {
              test: /\.ts$/,
              exclude: [/node_modules/],
              use: [
                {
                  loader: 'ts-loader',
                },
              ],
            },
            {
              test: /\.feature$/,
              use: [
                {
                  loader: '@badeball/cypress-cucumber-preprocessor/webpack',
                  options: config,
                },
              ],
            },
          ],
        },
      },
    })
  );
  return config;
}

export default defineConfig({
  viewportWidth: 1800,
  viewportHeight: 1080,
  retries: {
    runMode: 1,
    openMode: 1,
  },
  e2e: {
    env: {
      deployment: process.env.CYPRESS_ENV,
      waittime: parseInt(process.env['CYPRESS_TIMEOUT']) || 60000,
    },
    ...nxE2EPreset(__dirname),
    setupNodeEvents,
    supportFile: 'cypress/support/e2e.ts',
    baseUrl:
      process.env.CYPRESS_ENV != 'dev'
        ? `https://pro-${process.env.CYPRESS_ENV}.globalforestwatch.org`
        : 'https://localhost:8443',
    specPattern: '**/*.feature',
    defaultCommandTimeout: parseInt(process.env['CYPRESS_TIMEOUT']) || 120000,
    scrollBehavior: 'center',
  },
});
