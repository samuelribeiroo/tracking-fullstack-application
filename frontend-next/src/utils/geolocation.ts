// Function created to generate directions data in a valid state with lat e lng to enable maps api search
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number }> {
  const geocoder = new google.maps.Geocoder();

  try {
    const data = await new Promise<google.maps.GeocoderResult[]>(
      (resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results && results.length > 0) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      }
    );

    const { lat, lng } = data[0].geometry.location.toJSON();

    return { lat, lng };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao tentar localizar."
    );
  }
}

export async function getCurrentPosition(
  options?: PositionOptions
): Promise<{ lat: number; lng: number }> {
  try {
    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      }
    );

    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
  } catch (error) {
    throw new Error(
      error instanceof GeolocationPositionError
        ? error.message
        : "Falha ao obter a posição atual"
    );
  }
}
