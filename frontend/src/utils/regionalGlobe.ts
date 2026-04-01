/**
 * Regional maps (single continent / theater) should keep the globe fixed and framed
 * so players are not distracted by idle rotation when the whole theater is in view.
 */

export interface GlobeViewConfig {
  lock_rotation?: boolean;
  center_lat?: number;
  center_lng?: number;
  /** Camera distance — lower = more zoomed in (react-globe.gl altitude) */
  altitude?: number;
}

export interface DerivedRegionalGlobe {
  lockRotation: boolean;
  centerLat: number;
  centerLng: number;
  altitude: number;
}

/** Max spans (degrees) for auto “regional” lock when globe_view is absent */
const AUTO_LOCK_MAX_LAT_SPAN = 40;
const AUTO_LOCK_MAX_LNG_SPAN = 65;

export function deriveRegionalGlobeView(
  globeView: GlobeViewConfig | undefined,
  centers: Map<string, { lat: number; lng: number }>,
): DerivedRegionalGlobe {
  const explicitCenter =
    globeView &&
    globeView.center_lat != null &&
    globeView.center_lng != null;

  if (explicitCenter) {
    return {
      lockRotation: globeView!.lock_rotation !== false,
      centerLat: globeView!.center_lat!,
      centerLng: globeView!.center_lng!,
      altitude: globeView!.altitude ?? 1.55,
    };
  }

  if (centers.size === 0) {
    return {
      lockRotation: false,
      centerLat: 15,
      centerLng: 0,
      altitude: 2.4,
    };
  }

  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;
  for (const c of centers.values()) {
    minLat = Math.min(minLat, c.lat);
    maxLat = Math.max(maxLat, c.lat);
    minLng = Math.min(minLng, c.lng);
    maxLng = Math.max(maxLng, c.lng);
  }

  const latSpan = maxLat - minLat;
  const lngSpan = maxLng - minLng;
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  const fitsRegionalViewport =
    latSpan <= AUTO_LOCK_MAX_LAT_SPAN && lngSpan <= AUTO_LOCK_MAX_LNG_SPAN;

  const lockRotation =
    globeView?.lock_rotation === true ||
    (globeView?.lock_rotation !== false && fitsRegionalViewport);

  const span = Math.max(latSpan, lngSpan * 0.52);
  const autoAltitude = Math.min(2.75, Math.max(1.2, 1.05 + span * 0.038));

  return {
    lockRotation,
    centerLat,
    centerLng,
    altitude: globeView?.altitude ?? autoAltitude,
  };
}
