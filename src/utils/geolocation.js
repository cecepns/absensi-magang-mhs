// Haversine formula to calculate distance between two points
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

export function requestGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  });
}

// Default office coordinates (fallback)
const DEFAULT_OFFICE_COORDINATES = {
  latitude: -6.1751,
  longitude: 106.8650
};

const DEFAULT_MAX_DISTANCE = 500;

// Cache for office location
let officeLocationCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get office coordinates from API (with caching)
export async function getOfficeLocation() {
  // Return cached data if still valid
  if (officeLocationCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
    return officeLocationCache;
  }

  try {
    // Dynamic import to avoid circular dependency
    const ApiService = (await import('./api')).default;
    const location = await ApiService.getOfficeLocation();
    
    officeLocationCache = {
      latitude: parseFloat(location.latitude),
      longitude: parseFloat(location.longitude),
      maxDistance: location.max_distance_meters || DEFAULT_MAX_DISTANCE
    };
    cacheTimestamp = Date.now();
    
    return officeLocationCache;
  } catch (error) {
    console.warn('Failed to fetch office location from API, using default:', error);
    // Return default on error
    return {
      ...DEFAULT_OFFICE_COORDINATES,
      maxDistance: DEFAULT_MAX_DISTANCE
    };
  }
}

// Export default coordinates for backward compatibility
export const OFFICE_COORDINATES = DEFAULT_OFFICE_COORDINATES;
export const MAX_DISTANCE_METERS = DEFAULT_MAX_DISTANCE;