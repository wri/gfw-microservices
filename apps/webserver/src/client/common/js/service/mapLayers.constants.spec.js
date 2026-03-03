import { mapLayers } from './mapLayers.constants';

describe('mapLayers.constants', () => {
  describe('Layer URL Structure', () => {
    it('should export mapLayers as an array', () => {
      expect(Array.isArray(mapLayers)).toBe(true);
      expect(mapLayers.length).toBeGreaterThan(0);
    });

    it('should have valid layer structure', () => {
      mapLayers.forEach((layer) => {
        expect(layer).toHaveProperty('id');
        expect(layer).toHaveProperty('type');
        expect(layer).toHaveProperty('attributes');
      });
    });

    it('should have valid URLs in layerConfig', () => {
      const layersWithUrls = mapLayers.filter((layer) => layer.attributes?.layerConfig?.body?.url);

      layersWithUrls.forEach((layer) => {
        const url = layer.attributes.layerConfig.body.url;
        // URLs should start with http:// or https://
        expect(url).toMatch(/^https?:\/\//);
        // Should be a valid URL (allowing template variables)
        if (!url.includes('{')) {
          expect(() => new URL(url)).not.toThrow();
        }
      });
    });

    it('should have valid URLs in interactionConfig', () => {
      const layersWithInteractionUrls = mapLayers.filter(
        (layer) => layer.attributes?.interactionConfig?.config?.url
      );

      layersWithInteractionUrls.forEach((layer) => {
        const url = layer.attributes.interactionConfig.config.url;
        expect(url).toMatch(/^https:\/\//);
        expect(() => new URL(url)).not.toThrow();
      });
    });
  });

  describe('WDPA Protected Areas URLs', () => {
    const wdpaLayer = mapLayers.find((layer) => layer.attributes.slug === 'WDPA-Esri_1');

    it('should find WDPA layer', () => {
      expect(wdpaLayer).toBeDefined();
    });

    it('should have tiles URL with correct version format', () => {
      const tilesUrl = wdpaLayer?.attributes?.layerConfig?.body?.url;
      expect(tilesUrl).toBeDefined();
      expect(tilesUrl).toMatch(
        /https:\/\/tiles\.globalforestwatch\.org\/wdpa_licensed_protected_areas\/v\d{6}\/default\/root\.json/
      );
    });

    it('should have data-api URL with correct version format', () => {
      const apiUrl = wdpaLayer?.attributes?.interactionConfig?.config?.url;
      expect(apiUrl).toBeDefined();
      expect(apiUrl).toMatch(
        /https:\/\/data-api\.globalforestwatch\.org\/dataset\/wdpa_licensed_protected_areas\/v\d{6}\/features/
      );
    });

    it('should have matching versions in both URLs', () => {
      const tilesUrl = wdpaLayer?.attributes?.layerConfig?.body?.url;
      const apiUrl = wdpaLayer?.attributes?.interactionConfig?.config?.url;

      const tilesVersion = tilesUrl?.match(/v(\d{6})/)?.[1];
      const apiVersion = apiUrl?.match(/v(\d{6})/)?.[1];

      expect(tilesVersion).toBeDefined();
      expect(apiVersion).toBeDefined();
      expect(tilesVersion).toBe(apiVersion);
    });
  });

  describe('Other Versioned Datasets', () => {
    const testCases = [
      {
        name: 'Indonesia Forest Area',
        slug: 'Indonesia-Legal-Classifications_1',
        dataset: 'idn_forest_area',
      },
      {
        name: 'Land Rights',
        slug: 'Land-Rights-Esri',
        dataset: 'gfw_indigenous_community_and_indicative_lands',
      },
      {
        name: 'PRODES Deforestation',
        slug: 'PRODES-Deforestation-Vizz-Brazil_1',
        dataset: 'inpe_prodes',
      },
    ];

    testCases.forEach(({ name, slug, dataset }) => {
      it(`${name} should have valid versioned URLs`, () => {
        const layer = mapLayers.find((l) => l.attributes.slug === slug);
        if (!layer) {
          console.warn(`Layer ${name} (${slug}) not found - skipping test`);
          return;
        }

        const url = layer.attributes?.layerConfig?.body?.url;
        if (url) {
          expect(url).toMatch(new RegExp(`${dataset}/v\\d{6}`));
        }
      });
    });
  });
});
