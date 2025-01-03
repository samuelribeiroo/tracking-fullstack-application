
// Function created to generate directions data in a valid state with lat e lng to enable maps api search
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  const geocoder = new google.maps.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results && results.length > 0 && results[0].geometry.location) {
        const { lat, lng } = results[0].geometry.location.toJSON();
        resolve({ lat, lng });
      } else {
        reject(`Geocoding failed: ${status}`);
      }
    });
  });
}

export async function getCurrentPosition(
  options?: PositionOptions
): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      (error) => reject(error),
      options
    );
  });
}