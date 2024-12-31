'use server'

export async function searchDirections(source: string, destination: string) {
  const [sourceResponse, destinationResponse] = await Promise.all([
    fetch(`http://localhost:3000/places?text=${source}`),
    fetch(`http://localhost:3000/places?text=${destination}`),
  ]);

  if (!sourceResponse.ok)
    throw new Error("Não foi possível localizar inicio da rota");

  if (!destinationResponse.ok)
    throw new Error("Não foi possível localizar final da rota");

  const [sourceData, destinationData] = await Promise.all([
    sourceResponse.json(),
    destinationResponse.json(),
  ]);

  const placeSourceId = sourceData.candidates[0].place_id;
  const placeDestinationId = destinationData.candidates[0].place_id;

  const directionResponse = await fetch(
    `http://localhost:3000/directions?originId=${placeSourceId}&destinationId=${placeDestinationId}`
  );

  if (!directionResponse.ok)
    throw new Error("Não foi possível obter as direções.");

  const data = await directionResponse.json();

  const directionsData: Record<string, any> = {
    start: data.routes[0].legs[0].start_address,
    end: data.routes[0].legs[0].end_address,
    duration: data.routes[0].legs[0].duration.text,
    distance: data.routes[0].legs[0].distance.text,
  };

  return {
    data,
    placeSourceId,
    placeDestinationId,
    directionsData,
  };
}
