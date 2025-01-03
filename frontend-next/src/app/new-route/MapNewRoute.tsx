"use client";

import { geocodeAddress } from "@/src/utils/geolocation";
import { useMap } from "../../hooks/useMap";
import { DirectionsResponseData } from "@googlemaps/google-maps-services-js";
import { useEffect, useRef } from "react";

export type DirectionsData = DirectionsResponseData & { request: any, start: string, end: string };

export type MapNewRouteProps = {
  directionsData?: DirectionsData | null;
};

export function MapNewRoute(props: MapNewRouteProps) {
  const { directionsData } = props;
  const mapContainerRef = useRef<any>(null);
  const map = useMap(mapContainerRef);

  useEffect(() => {
    if (!map || !directionsData) return;
  
    async function plotRoute() {
      try {
        const startCoordinates = await geocodeAddress(directionsData!.start);
        const endCoordinates = await geocodeAddress(directionsData!.end);
  
        map!.removeAllRoutes();
        map!.addRouteWithIcons({
          routeId: "1",
          startMarkerOptions: {
            position: startCoordinates,
          },
          endMarkerOptions: {
            position: endCoordinates,
          },
          carMarkerOptions: {
            position: startCoordinates,
          },
        });
      } catch (error) {
        console.error("Erro ao renderizar endereços:", error);
      }
    }
  
    plotRoute();
  }, [map, directionsData]);
  

  return (
    <>
      <div className="w-2/3 h-full" ref={mapContainerRef}></div>
    </>
  );
}
