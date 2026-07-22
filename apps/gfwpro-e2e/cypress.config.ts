import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nrwl/cypress/plugins/cypress-preset';

async function setupNodeEvents(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
): Promise<Cypress.PluginConfigOptions> {
  // Lazy-load these packages to avoid tsx/esbuild loader clashes while Cypress is evaluating the TS config file.
  const [{ default: webpack }, { addCucumberPreprocessorPlugin }] = await Promise.all([
    import('@cypress/webpack-preprocessor'),
    import('@badeball/cypress-cucumber-preprocessor'),
  ]);

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
        // Suppress warnings about module resolution
        ignoreWarnings: [/Module not found/, /Can't resolve/, /plausible module/],
      },
    })
  );

  return config;
}

// 60 seconds
const DEFAULT_COMMAND_TIMEOUT = 60 * 1000;

export default defineConfig({
  video: true,
  viewportWidth: 1800,
  viewportHeight: 1080,
  numTestsKeptInMemory: 100,
  experimentalMemoryManagement: true,
  retries: {
    runMode: 0,
    openMode: 0,
  },
  e2e: {
    env: {
      deployment: process.env.CYPRESS_ENV,
      waittime: parseInt(process.env.CYPRESS_TIMEOUT || '', 10) || 30000,
      language: 'en-US',
      hideThirdPartyRequests: true, // Set to false to disable third-party request filtering
    },
    ...nxE2EPreset(__dirname),
    setupNodeEvents,
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    baseUrl:
      process.env.CYPRESS_ENV !== 'dev'
        ? `https://pro-${process.env.CYPRESS_ENV}.globalforestwatch.org`
        : 'https://localhost:8443',
    specPattern: '**/*.feature',
    defaultCommandTimeout:
      parseInt(process.env.CYPRESS_TIMEOUT || '', 10) || DEFAULT_COMMAND_TIMEOUT,
    scrollBehavior: 'center',
    chromeWebSecurity: false,
    experimentalModifyObstructiveThirdPartyCode: true,
  },
});
