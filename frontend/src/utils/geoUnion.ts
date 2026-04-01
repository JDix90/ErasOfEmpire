/**
 * Boolean union of GeoJSON polygons (dissolve internal edges between adjacent parts).
 * Uses polyclip-ts (same engine as @turf/intersect). Rewinds output for globe fill.
 */

import { union as polyclipUnion } from 'polyclip-ts';
import rewind from '@turf/rewind';
import { feature } from '@turf/helpers';

type Poly = [number, number][][];
type MultiPoly = Poly[];

function geomToPolyclip(g: GeoJSON.Polygon | GeoJSON.MultiPolygon): Poly | MultiPoly {
  return g.type === 'Polygon' ? (g.coordinates as Poly) : (g.coordinates as MultiPoly);
}

function polyclipToGeoJSON(mp: MultiPoly): GeoJSON.Polygon | GeoJSON.MultiPolygon {
  if (mp.length === 0) {
    throw new Error('polyclip union returned empty geometry');
  }
  if (mp.length === 1) {
    return { type: 'Polygon', coordinates: mp[0] };
  }
  return { type: 'MultiPolygon', coordinates: mp };
}

/**
 * Union one or more polygons/multipolygons into a single dissolved geometry.
 */
export function unionGeoJsonGeometries(
  geoms: (GeoJSON.Polygon | GeoJSON.MultiPolygon)[]
): GeoJSON.Polygon | GeoJSON.MultiPolygon | null {
  if (geoms.length === 0) return null;
  if (geoms.length === 1) return geoms[0];

  let acc: MultiPoly = polyclipUnion(geomToPolyclip(geoms[0]), geomToPolyclip(geoms[1]));
  for (let i = 2; i < geoms.length; i++) {
    acc = polyclipUnion(acc, geomToPolyclip(geoms[i]));
  }
  const merged = polyclipToGeoJSON(acc);
  const rewound = rewind(feature(merged), { reverse: true }) as GeoJSON.Feature<
    GeoJSON.Polygon | GeoJSON.MultiPolygon
  >;
  return rewound.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
}
