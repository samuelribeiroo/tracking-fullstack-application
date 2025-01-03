"use client";

import { FormEvent, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { searchDirections } from "../actions/route-actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import NewRouteForm from "./NewRouteForm";
import useToastNotifications from "@/src/hooks/useToastNotification";
import { ToastContainer } from "react-toastify";
import { DirectionsData, MapNewRoute } from "./MapNewRoute";

export default function NewRoutePage() {
  const [loading, setLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState<DirectionsData | null>(null);
  const [placeIds, setPlaceIds] = useState<{
    sourceId: string;
    destinationId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [routeState, setRouteState] = useState(null);
  const router = useRouter();


  useToastNotifications(routeState);

  const handleSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const source = formData.get("source") as string;
    const destination = formData.get("destination") as string;

    try {
      const result = await searchDirections(source, destination);
      setRouteInfo(result.directionsData as DirectionsData);
      setPlaceIds({
        sourceId: result.placeSourceId,
        destinationId: result.placeDestinationId,
      });
      router.push(
        `/new-route?source=${encodeURIComponent(
          source
        )}&destination=${encodeURIComponent(destination)}`
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col lg:flex-row h-screen">
      <div className="lg:w-1/2 p-4 overflow-y-auto">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Nova Rota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitForm} className="flex flex-col space-y-6">
              <div className="relative">
                <Label htmlFor="source">Origem</Label>
                <Input
                  type="text"
                  id="source"
                  name="source"
                  placeholder=""
                  required
                  className="mt-2"
                />
              </div>
              <div className="relative">
                <Label htmlFor="destination">Destino</Label>
                <Input
                  type="text"
                  id="destination"
                  name="destination"
                  placeholder=""
                  required
                  className="mt-2"
                />
              </div>

              <Button
                type="submit"
                className="bg-primary text-default w-full"
                disabled={loading}
              >
                {loading ? <Loader2 /> : "Calcular Rota"}
              </Button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {routeInfo && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-xl">Informações da Rota</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    {Object.entries(routeInfo).map(([key, value]) => (
                      <div key={key}>
                        <dt className="font-semibold mb-2">
                          {key === "start"
                            ? "Origem"
                            : key === "end"
                            ? "Destino"
                            : key === "duration"
                            ? "Duração"
                            : key === "distance"
                            ? "Distância"
                            : key}
                        </dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                    <ToastContainer />
                    <NewRouteForm>
                      {placeIds && (
                        <>
                          <input
                            type="hidden"
                            name="sourceId"
                            defaultValue={placeIds.sourceId}
                          />
                          <input
                            type="hidden"
                            name="destinationId"
                            defaultValue={placeIds.destinationId}
                          />
                        </>
                      )}
                      <Button
                        size="lg"
                        className="bg-primary text-default"
                        disabled={loading}
                      >
                        Adicionar Rota
                      </Button>
                    </NewRouteForm>
                  </dl>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
      <MapNewRoute directionsData={routeInfo} />        
    </section>
  );
}
