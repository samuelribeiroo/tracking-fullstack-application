"use client";

import Map from "@/src/components/ui/map";
import { useMap } from "@/src/hooks/useMap";
import { isValidCoordinate } from "@/src/utils/geolocation";
import { MapDriverProps } from "@/src/utils/models";
import { socket } from "@/src/utils/socket-io";
import { useEffect, useRef } from "react";

/*

Temporary Logic.

The following commit is to highligt the good functioning of application. 

The backend connected with Google Maps API being managed routes send and receiving coordinates with WebSockt is working.

If u start application its possible to see it the car marker being movimented inside the map with the route that was defined previely at api/new-route (once time created, id is generated and go to mongodb) and then is possible catch by id with 'query params' and manipulating and starting one route

*/


export function MapDriver({ route_id, start_location, end_location }: MapDriverProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useMap(mapContainerRef);

  useEffect(() => {
    if (
      !map ||
      !route_id ||
      !start_location ||
      !end_location ||
      !isValidCoordinate(start_location) || // Assure that received data its in a valid format
      !isValidCoordinate(end_location)
    )
      return;

    const startLatLng = new google.maps.LatLng(
      start_location.lat,
      start_location.lng
    );
    const endLatLng = new google.maps.LatLng(
      end_location.lat,
      end_location.lng
    );

    if (socket.disconnected) socket.connect();

    const eventName = `server:new-points/${route_id}:list`;
    socket.on(
      eventName,
      (receivedData: { route_id: string; lat?: number; lng?: number }) => {
        const { route_id, lat, lng } = receivedData;

        // Assure that is not undefined again
        if (lat === undefined || lng === undefined) {
          console.error("Coordenadas ausentes no evento:", receivedData);
          return;
        }

        if (!map.hasRoute(route_id)) {
          console.log("Adicionando nova rota ao mapa...");
          map.addRouteWithIcons({
            routeId: String(route_id),
            startMarkerOptions: {
              position: startLatLng,
            },
            endMarkerOptions: {
              position: endLatLng,
            },
            carMarkerOptions: {
              position: startLatLng,
            },
          });
        }

        console.log("Movendo carro para:", { lat, lng });
        map.moveCar(route_id, { lat, lng });
      }
    );

    socket.emit("client:new-points", { route_id });

    return () => {
      socket.off(eventName);
    };
  }, [route_id, start_location, end_location, map]);

  return <Map ref={mapContainerRef} />;
}