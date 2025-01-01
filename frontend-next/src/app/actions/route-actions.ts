"use server";

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

export type RouteState = {
  error?: string;
  success?: boolean;
} | null;

export async function createRouteAction(state: RouteState, formData: FormData) {
  try {
    const sourceId = formData.get("sourceId");
    const destinationId = formData.get("destinationId");

    if (!sourceId || !destinationId) return { error: 'Source ID e Destination ID são obrigatórios', success: false };
    

    const directionResponse = await fetch(
      `http://localhost:3000/directions?originId=${sourceId}&destinationId=${destinationId}`
    );

    if (!directionResponse.ok) {
      return { error: 'Não foi possível obter as direções da rota.', success: false };
    }

    const data = await directionResponse.json();

    if (!data.routes?.[0]?.legs?.[0]) {
      return { error: 'Dados da rota inválidos ou incompletos.', success: false };
    }

    const startAddress = data.routes[0].legs[0].start_address;
    const endAddress = data.routes[0].legs[0].end_address;

    const response = await fetch(`http://localhost:3000/routes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${startAddress} - ${endAddress}`,
        source_id: data.request.origin.place_id.replace("place_id:", ""),
        destination_id: data.request.destination.place_id.replace("place_id:", ""),
        startAddress,
        endAddress,
      }),
    });

    if (!response.ok) {
      return { error: 'Não foi possível criar a rota.', success: false };
    }

    return { success: true, error: undefined };
  } catch (err) {
    return { error: 'Ocorreu um erro ao processar a rota.', success: false };
  }
}

