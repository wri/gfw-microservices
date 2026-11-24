import Graphic from '@arcgis/core/Graphic';
import Popup from '@arcgis/core/widgets/Popup';

// Configs
import { centroidSymbol } from '../map.config';

/**
 * @description - Returns a live ESRI Popup widget for the given view, creating one if needed.
 *
 * ArcGIS 4.34 creates the Popup widget lazily: `view.popup` is only a plain properties
 * placeholder until the popup is first opened, so `watch()`, `on()`, `open()` and
 * `viewModel` are unavailable right after `view.when()`. Call this before using the
 * Popup API so callers do not depend on whether a popup has been opened yet.
 *
 * @param {Object} view - ESRI MapView (or SceneView).
 * @param {Object} [properties] - Optional Popup properties (e.g. viewModel, actions).
 * @return {Object|null} - The live Popup widget, or null when no view is provided.
 */
export function ensurePopupWidget(view, properties = {}) {
  if (!view) {
    return null;
  }

  const { popup } = view;

  // Already a live Popup widget (e.g. Map.js assigns one explicitly).
  if (popup && typeof popup.watch === 'function') {
    return popup;
  }

  // `popup` is a plain properties placeholder (or nullish) in ArcGIS 4.34.
  // Drop the placeholder's `open`/`close` stubs so they do not shadow the widget API.
  const popupProperties = { ...(popup ?? {}) };
  delete popupProperties.open;
  delete popupProperties.close;

  view.popup = new Popup({
    ...popupProperties,
    ...properties,
    view,
  });

  return view.popup;
}

/**
 * @description - Creates an ESRI Graphic representing a point centroid based on specified longitude and latitude coordinates. This graphic can include additional attributes for further details or styling.
 *
 * @param {number} Longitude - The geographical longitude coordinate of the centroid.
 * @param {number} Latitude - The geographical latitude coordinate of the centroid.
 * @param {Object} attributes - Optional. Additional properties or attributes to be assigned to the graphic, such as metadata or styling information.
 * @return {Graphic} - An ESRI Graphic object representing a point at the specified coordinates, with any provided attributes.
 */
export function generateCentroidGraphic(Longitude, Latitude, attributes = {}) {
  const centroidPoint = {
    type: 'point',
    longitude: Longitude,
    latitude: Latitude,
  };

  const listLocationCentroidGraphic = new Graphic({
    geometry: centroidPoint,
    symbol: centroidSymbol,
    attributes,
  });

  return listLocationCentroidGraphic;
}
