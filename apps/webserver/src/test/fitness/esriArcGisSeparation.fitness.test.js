import fs from 'fs';
import * as glob from 'glob';

const loadedBundleContentFor = (viewName) => {
  const filePattern = `./public/${viewName}.*.js`;
  const filename = glob.sync(filePattern)[0];
  return { filename, content: fs.readFileSync(filename, 'utf-8') };
};

/*
 * This fitness function test suite is important for our ArcGIS AMD to ESM migration.
 * It is necessary to ensure that the ArcGIS modules are only being loaded via one mechanism.
 * Mixing AMD and ESM dependencies creates errors and spooky action at a distance.
 * Avoiding a mashup is vital for a successful transition to ESM.
 */
describe('Proper ArcGIS Module Use', () => {
  describe('Bundles Using ArcGIS Modules', () => {
    describe('Loading Via ESM', () => {
      test('[map] bundle', () => {
        const content = loadedBundleContentFor('map');
        expect(content).toDependOnArcGISModules();
        expect(content).toUseEsmArcGISModules();
      });

      test('[locations] bundle', () => {
        const content = loadedBundleContentFor('locations');
        expect(content).toDependOnArcGISModules();
        expect(content).toUseEsmArcGISModules();
      });

      test('[diagnostics] bundle', () => {
        const content = loadedBundleContentFor('diagnostics');
        expect(content).toDependOnArcGISModules();
        expect(content).toUseEsmArcGISModules();
      });
    });

    describe('Loading Via AMD', () => {
      test('[dashboard] bundle', () => {
        const content = loadedBundleContentFor('dashboard');
        expect(content).toDependOnArcGISModules();
        expect(content).toUseAmdArcGISModules();
      });
    });
  });

  describe('Bundles NOT Using ArcGIS Modules', () => {
    test('[about] bundle', () => {
      expect(loadedBundleContentFor('about')).not.toDependOnArcGISModules();
    });

    test('[account] bundle', () => {
      expect(loadedBundleContentFor('account')).not.toDependOnArcGISModules();
    });

    test('[activityLog] bundle', () => {
      expect(loadedBundleContentFor('activityLog')).not.toDependOnArcGISModules();
    });

    test('[admin] bundle', () => {
      expect(loadedBundleContentFor('admin')).not.toDependOnArcGISModules();
    });

    test('[analytics] bundle', () => {
      expect(loadedBundleContentFor('analytics')).not.toDependOnArcGISModules();
    });

    test('[b2b] bundle', () => {
      expect(loadedBundleContentFor('b2b')).not.toDependOnArcGISModules();
    });

    test('[change] bundle', () => {
      expect(loadedBundleContentFor('change')).not.toDependOnArcGISModules();
    });

    test('[changeExist] bundle', () => {
      expect(loadedBundleContentFor('changeExist')).not.toDependOnArcGISModules();
    });

    test('[forgot] bundle', () => {
      expect(loadedBundleContentFor('forgot')).not.toDependOnArcGISModules();
    });

    test('[login] bundle', () => {
      expect(loadedBundleContentFor('login')).not.toDependOnArcGISModules();
    });

    test('[manager] bundle', () => {
      expect(loadedBundleContentFor('manager')).not.toDependOnArcGISModules();
    });

    test('[more] bundle', () => {
      expect(loadedBundleContentFor('more')).not.toDependOnArcGISModules();
    });

    test('[profile] bundle', () => {
      expect(loadedBundleContentFor('profile')).not.toDependOnArcGISModules();
    });

    test('[proManagerList] bundle', () => {
      expect(loadedBundleContentFor('proManagerList')).not.toDependOnArcGISModules();
    });

    test('[reset] bundle', () => {
      expect(loadedBundleContentFor('reset')).not.toDependOnArcGISModules();
    });

    test('[select] bundle', () => {
      expect(loadedBundleContentFor('select')).not.toDependOnArcGISModules();
    });

    test('[userProfile] bundle', () => {
      expect(loadedBundleContentFor('userProfile')).not.toDependOnArcGISModules();
    });

    test('[verify] bundle', () => {
      expect(loadedBundleContentFor('verify')).not.toDependOnArcGISModules();
    });
  });
});

/*****************************************************************************************************************
 * Custom Jest matchers to better communicate various architecture and design decisions that we want to enforce. *
 *****************************************************************************************************************/
expect.extend({
  toUseMutuallyExclusiveModuleDefinitions({ file, content }) {
    const pass = content.includes('require("esri/') !== content.includes('@arcgis/core');
    if (pass) {
      return {
        message: () =>
          `expected ${file} NOT to use mutually exclusive module definitions (this might not be what you want)`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${file} to use mutually exclusive module definitions (both AMD and ESM modules were found)`,
        pass: false,
      };
    }
  },
});

expect.extend({
  toDependOnArcGISModules({ filename, content }) {
    const pass = content.includes('require("esri/') || content.includes('@arcgis/core');
    if (pass) {
      return {
        message: () => `expected ${filename} NOT to depend on ArcGIS modules`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${filename} to depend on ArcGIS modules`,
        pass: false,
      };
    }
  },
});

// This matcher will fail if AMD dependencies are found regardless of whether ESM dependencies exist
expect.extend({
  toUseEsmArcGISModules({ filename, content }) {
    const pass = content.includes('@arcgis/core') && !content.includes('require("esri/');
    if (pass) {
      return {
        message: () => `expected ${filename} NOT to use ESM ArcGIS modules exclusively`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${filename} to use ESM ArcGIS modules exclusively`,
        pass: false,
      };
    }
  },
});

// This matcher will fail if ESM dependencies are found regardless of whether AMD dependencies exist
expect.extend({
  toUseAmdArcGISModules({ filename, content }) {
    const pass = content.includes('require("esri/') && !content.includes('@arcgis/core');
    if (pass) {
      return {
        message: () => `expected ${filename} NOT to use AMD ArcGIS modules exclusively`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${filename} to use AMD ArcGIS modules exclusively`,
        pass: false,
      };
    }
  },
});
