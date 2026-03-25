export type ObserverCoordinates = {
  latitude: number;
  longitude: number;
};

export type HorizontalCoordinates = {
  altitude: number;
  azimuth: number;
  hourAngle: number;
  localSiderealTime: number;
};

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function radiansToDegrees(value: number) {
  return (value * 180) / Math.PI;
}

function extractNumericParts(value: string) {
  return value
    .trim()
    .replace(/[^\d+-.]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => Number.parseFloat(part));
}

export function parseRightAscension(value: string) {
  const parts = extractNumericParts(value);

  if (!parts.length || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }

  const hours = parts[0] + (parts[1] ?? 0) / 60 + (parts[2] ?? 0) / 3600;

  return hours * 15;
}

export function parseDeclination(value: string) {
  const parts = extractNumericParts(value);

  if (!parts.length || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }

  const sign = value.trim().startsWith("-") ? -1 : 1;
  const degrees = Math.abs(parts[0]) + (parts[1] ?? 0) / 60 + (parts[2] ?? 0) / 3600;

  return sign * degrees;
}

export function getJulianDate(date: Date) {
  return date.getTime() / 86400000 + 2440587.5;
}

export function getGreenwichSiderealTime(date: Date) {
  const julianDate = getJulianDate(date);
  const daysSinceJ2000 = julianDate - 2451545.0;
  const centuriesSinceJ2000 = daysSinceJ2000 / 36525;

  return normalizeDegrees(
    280.46061837 +
      360.98564736629 * daysSinceJ2000 +
      0.000387933 * centuriesSinceJ2000 * centuriesSinceJ2000 -
      (centuriesSinceJ2000 * centuriesSinceJ2000 * centuriesSinceJ2000) / 38710000,
  );
}

export function equatorialToHorizontal(
  rightAscension: string,
  declination: string,
  observer: ObserverCoordinates,
  date: Date,
): HorizontalCoordinates | null {
  const rightAscensionDegrees = parseRightAscension(rightAscension);
  const declinationDegrees = parseDeclination(declination);

  if (rightAscensionDegrees === null || declinationDegrees === null) {
    return null;
  }

  const localSiderealTime = normalizeDegrees(getGreenwichSiderealTime(date) + observer.longitude);
  const hourAngle = normalizeDegrees(localSiderealTime - rightAscensionDegrees);

  const latitudeRadians = degreesToRadians(observer.latitude);
  const declinationRadians = degreesToRadians(declinationDegrees);
  const hourAngleRadians = degreesToRadians(hourAngle);

  const sinAltitude =
    Math.sin(declinationRadians) * Math.sin(latitudeRadians) +
    Math.cos(declinationRadians) * Math.cos(latitudeRadians) * Math.cos(hourAngleRadians);
  const altitude = radiansToDegrees(Math.asin(clamp(sinAltitude, -1, 1)));

  const azimuth =
    normalizeDegrees(
      radiansToDegrees(
        Math.atan2(
          Math.sin(hourAngleRadians),
          Math.cos(hourAngleRadians) * Math.sin(latitudeRadians) -
            Math.tan(declinationRadians) * Math.cos(latitudeRadians),
        ),
      ) + 180,
    );

  return {
    altitude,
    azimuth,
    hourAngle,
    localSiderealTime,
  };
}

export function getSignedAngleDifference(target: number, current: number) {
  return ((target - current + 540) % 360) - 180;
}

export function normalizeHeading(value: number) {
  return normalizeDegrees(value);
}
