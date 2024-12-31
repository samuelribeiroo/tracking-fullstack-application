import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import Button from "../../components/ui/button";
import Input from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

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

  const placeSourceId = await sourceData.candidates[0].place_id;
  const placeDestinationId = await destinationData.candidates[0].place_id;

  const directionResponse = await fetch(
    `http://localhost:3000/directions?originId=${placeSourceId}&destinationId=${placeDestinationId}`
  );

  if (!destinationResponse.ok)
    throw new Error("Não foi possível obter as direções.");

  const directionData = await directionResponse.json();

  return {
    directionData,
    placeSourceId,
    placeDestinationId,
  };
}

export default async function NewRoutePage({
  searchParams,
}: {
  searchParams: Promise<{ source: string; destination: string }>;
}) {
  const { source, destination } = await searchParams;

  const result =
    source && destination ? await searchDirections(source, destination) : null;

  let directionData = null;
  let placeSourceId = null;
  let placeDestinationId = null;

  if (result) {
    directionData = result.directionData;
    placeSourceId = result.placeSourceId;
    placeDestinationId = result.placeDestinationId;
  }

  return (
    <>
      <section className="flex flex-col lg:flex-row h-screen">
        <div className="lg:w-1/2 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Nova Rota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form method="get" className="flex flex-col space-y-6">
                <div className="relative">
                  <Label htmlFor="source">Origem</Label>
                  <Input type="text" id="source" name="source" placeholder="" />
                </div>
                <div className="relative">
                  <Label htmlFor="destination">Destino</Label>
                  <Input
                    type="text"
                    id="destination"
                    name="destination"
                    placeholder=""
                  />
                </div>

                <Button
                  type="submit"
                  className="bg-primary text-default w-full"
                >
                  Calcular Rota
                </Button>
              </form>

              {directionData && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Informações da Rota
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div>
                        <dt className="font-semibold mb-2">Origem</dt>
                        <dd>{directionData.routes[0].legs[0].start_address}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold mb-2">Destino</dt>
                        <dd>{directionData.routes[0].legs[0].end_address}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold mb-2">Duração</dt>
                        <dd>{directionData.routes[0].legs[0].duration.text}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold mb-2">Distância</dt>
                        <dd>{directionData.routes[0].legs[0].distance.text}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
