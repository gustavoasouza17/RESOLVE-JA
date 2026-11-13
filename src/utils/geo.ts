export type GeoPoint = {
  latitude: number;
  longitude: number;
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const EARTH_RADIUS_KM = 6371;

/**
 * Distância real entre dois pontos na superfície terrestre
 * (fórmula de Haversine), em quilômetros.
 */
export function haversineKm(from: GeoPoint, to: GeoPoint): number {
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(deltaLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export function isValidLatitude(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= -90 &&
    value <= 90
  );
}

export function isValidLongitude(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= -180 &&
    value <= 180
  );
}
