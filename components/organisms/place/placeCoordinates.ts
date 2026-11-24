export function hasPlaceCoordinates(lng: number, lat: number) {
  return (
    Number.isFinite(lng) && Math.abs(lng) <= 180 &&
    Number.isFinite(lat) && Math.abs(lat) <= 90 &&
    (lng !== 0 || lat !== 0)
  );
}
