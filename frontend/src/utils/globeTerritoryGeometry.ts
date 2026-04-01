/**
 * Builds the same GeoJSON geometry per territory as GlobeMap (countries/states/Risorgimento/ACW/canvas).
 * Used by GlobeMap rendering and by scripts that derive land adjacency from globe borders.
 */

import {
  TERRITORY_GEO_CONFIG,
  TERRITORY_ISO_MAP,
  type TerritoryGeoConfig,
  type ClipBbox,
} from '../data/territoryGeoMapping';
import { ACW_TERRITORY_STATES } from '../data/acwStateMap';
import { RISORGIMENTO_TERRITORY_PARTS } from '../data/risorgimentoRegionMap';
import { clipToBbox } from './geoClip';
import { unionGeoJsonGeometries } from './geoUnion';
/** Minimal territory shape for geometry building (matches GameMap + GlobeMap props). */
export interface GlobeTerritoryInput {
  territory_id: string;
  name: string;
  polygon: number[][];
  center_point: [number, number];
  geo_config?: TerritoryGeoConfig;
  iso_codes?: string[];
  clip_bbox?: ClipBbox;
  geo_polygon?: [number, number][];
}

export interface PolygonData {
  territory_id: string;
  name: string;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

type TerritoryRow = GlobeTerritoryInput;

function canvasToGeoJSON(
  polygon: number[][],
  canvasW: number,
  canvasH: number,
): [number, number][] {
  return polygon.map(([x, y]) => {
    const lng = (x / canvasW) * 360 - 180;
    const lat = 90 - (y / canvasH) * 180;
    return [lng, lat];
  });
}

function getPolygonCoordinates(
  geom: GeoJSON.Polygon | GeoJSON.MultiPolygon,
): GeoJSON.Position[][][] {
  if (geom.type === 'Polygon') return [geom.coordinates];
  return geom.coordinates;
}

function centerPlaceholderGeometry(
  centerPoint: [number, number],
  canvasW: number,
  canvasH: number,
): GeoJSON.Polygon {
  const cx = centerPoint[0];
  const cy = centerPoint[1];
  const cLng = (cx / canvasW) * 360 - 180;
  const cLat = 90 - (cy / canvasH) * 180;
  const d = 0.01;
  return {
    type: 'Polygon',
    coordinates: [
      [
        [cLng - d, cLat - d],
        [cLng + d, cLat - d],
        [cLng + d, cLat + d],
        [cLng - d, cLat + d],
        [cLng - d, cLat - d],
      ],
    ],
  };
}

function mergeGeometries(
  geometries: (GeoJSON.Polygon | GeoJSON.MultiPolygon)[],
): GeoJSON.MultiPolygon {
  const polygons: GeoJSON.Position[][][] = [];
  for (const geom of geometries) {
    for (const poly of getPolygonCoordinates(geom)) {
      if (poly && poly[0] && poly[0].length >= 4) {
        polygons.push(poly);
      }
    }
  }
  return { type: 'MultiPolygon', coordinates: polygons };
}

export interface GlobeGeometryInputs {
  countriesGeo: GeoJSON.FeatureCollection | null;
  statesGeo: GeoJSON.FeatureCollection | null;
  risorgimentoGeo: GeoJSON.FeatureCollection | null;
}

/**
 * Build globe geometry for every territory — mirrors GlobeMap `polygonsData` logic.
 */
export function buildTerritoryGlobeGeometries(
  mapData: { canvas_width?: number; canvas_height?: number; territories: GlobeTerritoryInput[] },
  { countriesGeo, statesGeo, risorgimentoGeo }: GlobeGeometryInputs,
): PolygonData[] {
  const canvasW = mapData.canvas_width ?? 1200;
  const canvasH = mapData.canvas_height ?? 700;

  const isoToFeatures = new Map<string, GeoJSON.Feature[]>();
  if (countriesGeo?.features) {
    for (const f of countriesGeo.features) {
      const props = f.properties ?? {};
      const iso = props['ISO_A2'] ?? props['iso_a2'];
      const isoEH = props['ISO_A2_EH'] ?? props['iso_a2_eh'];
      const code =
        iso && iso !== '-99' ? iso : isoEH && isoEH !== '-99' ? isoEH : null;
      if (code && typeof code === 'string') {
        const list = isoToFeatures.get(code) ?? [];
        list.push(f);
        isoToFeatures.set(code, list);
      }
    }
  }

  const postalToGeom = new Map<string, GeoJSON.Polygon | GeoJSON.MultiPolygon>();
  if (statesGeo?.features) {
    for (const f of statesGeo.features) {
      const props = f.properties ?? {};
      if (props['adm0_a3'] !== 'USA') continue;
      const postal = props['postal'];
      if (typeof postal !== 'string' || postal === 'AK' || postal === 'HI') continue;
      const g = f.geometry;
      if (g && (g.type === 'Polygon' || g.type === 'MultiPolygon')) {
        postalToGeom.set(postal, g as GeoJSON.Polygon | GeoJSON.MultiPolygon);
      }
    }
  }

  const iso3166ToGeom = new Map<string, GeoJSON.Polygon | GeoJSON.MultiPolygon>();
  if (risorgimentoGeo?.features) {
    for (const f of risorgimentoGeo.features) {
      const props = f.properties ?? {};
      const code = props['iso_3166_2'];
      if (typeof code !== 'string') continue;
      const g = f.geometry;
      if (g && (g.type === 'Polygon' || g.type === 'MultiPolygon')) {
        iso3166ToGeom.set(code, g as GeoJSON.Polygon | GeoJSON.MultiPolygon);
      }
    }
  }

  return mapData.territories.map((raw) => {
    const territory = raw as TerritoryRow;

    const risParts = RISORGIMENTO_TERRITORY_PARTS[territory.territory_id];
    if (risParts) {
      if (risorgimentoGeo === null) {
        return {
          territory_id: territory.territory_id,
          name: territory.name,
          geometry: centerPlaceholderGeometry(territory.center_point, canvasW, canvasH),
        };
      }
      if (iso3166ToGeom.size > 0) {
        const geoms: (GeoJSON.Polygon | GeoJSON.MultiPolygon)[] = [];
        for (const code of risParts) {
          const g = iso3166ToGeom.get(code);
          if (g) geoms.push(g);
        }
        if (geoms.length === risParts.length) {
          try {
            const merged = unionGeoJsonGeometries(geoms);
            if (merged) {
              return {
                territory_id: territory.territory_id,
                name: territory.name,
                geometry: merged,
              };
            }
          } catch {
            /* fall through */
          }
        }
      }
    }

    const acwStates = ACW_TERRITORY_STATES[territory.territory_id];
    if (acwStates) {
      if (statesGeo === null) {
        return {
          territory_id: territory.territory_id,
          name: territory.name,
          geometry: centerPlaceholderGeometry(territory.center_point, canvasW, canvasH),
        };
      }

      if (postalToGeom.size > 0) {
        const geoms: (GeoJSON.Polygon | GeoJSON.MultiPolygon)[] = [];
        for (const code of acwStates) {
          const g = postalToGeom.get(code);
          if (g) geoms.push(g);
        }
        if (geoms.length === acwStates.length) {
          try {
            const merged = unionGeoJsonGeometries(geoms);
            if (merged) {
              return {
                territory_id: territory.territory_id,
                name: territory.name,
                geometry: merged,
              };
            }
          } catch {
            /* fall through */
          }
        }
      }
    }

    const geoConfig =
      territory.geo_config ?? TERRITORY_GEO_CONFIG[territory.territory_id];
    const isoCodes = territory.iso_codes ?? TERRITORY_ISO_MAP[territory.territory_id];
    const useGeo = (geoConfig && geoConfig.length > 0) || (isoCodes && isoCodes.length > 0);
    const hasData = useGeo && countriesGeo && isoToFeatures.size > 0;

    if (hasData) {
      let geometries: (GeoJSON.Polygon | GeoJSON.MultiPolygon)[] = [];

      if (geoConfig && geoConfig.length > 0) {
        for (const item of geoConfig) {
          const features = isoToFeatures.get(item.iso) ?? [];
          for (const f of features) {
            const geom = f.geometry;
            if (!geom || (geom.type !== 'Polygon' && geom.type !== 'MultiPolygon')) continue;
            const g = geom as GeoJSON.Polygon | GeoJSON.MultiPolygon;
            if (item.clip_bbox) {
              const clipped = clipToBbox(g, item.clip_bbox);
              if (clipped) geometries.push(clipped);
            } else {
              geometries.push(g);
            }
          }
        }
      } else if (isoCodes && isoCodes.length > 0) {
        for (const code of isoCodes) {
          const features = isoToFeatures.get(code) ?? [];
          for (const f of features) {
            const geom = f.geometry;
            if (geom && (geom.type === 'Polygon' || geom.type === 'MultiPolygon')) {
              geometries.push(geom as GeoJSON.Polygon | GeoJSON.MultiPolygon);
            }
          }
        }
        if (geometries.length > 0 && territory.clip_bbox) {
          const merged = mergeGeometries(geometries);
          const clipped = clipToBbox(merged, territory.clip_bbox);
          geometries = clipped ? [clipped] : [];
        }
      }

      if (geometries.length > 0) {
        const merged =
          geometries.length === 1 && geometries[0].type === 'Polygon'
            ? geometries[0]
            : mergeGeometries(geometries);
        return {
          territory_id: territory.territory_id,
          name: territory.name,
          geometry: merged,
        };
      }

      return {
        territory_id: territory.territory_id,
        name: territory.name,
        geometry: centerPlaceholderGeometry(territory.center_point, canvasW, canvasH),
      };
    }

    if (territory.geo_polygon && territory.geo_polygon.length >= 3) {
      const ring: [number, number][] = [...territory.geo_polygon];
      if (
        ring[0][0] !== ring[ring.length - 1][0] ||
        ring[0][1] !== ring[ring.length - 1][1]
      ) {
        ring.push([...ring[0]]);
      }
      return {
        territory_id: territory.territory_id,
        name: territory.name,
        geometry: { type: 'Polygon', coordinates: [ring] },
      };
    }

    const coords = canvasToGeoJSON(territory.polygon, canvasW, canvasH);
    if (
      coords.length > 1 &&
      (coords[0][0] !== coords[coords.length - 1][0] ||
        coords[0][1] !== coords[coords.length - 1][1])
    ) {
      coords.push([...coords[0]]);
    }
    return {
      territory_id: territory.territory_id,
      name: territory.name,
      geometry: { type: 'Polygon', coordinates: [coords] },
    };
  });
}
