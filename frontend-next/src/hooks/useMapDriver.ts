"use client"

import { useEffect, useRef } from "react";
import { useMap } from "./useMap"; 
import { MapDriverProps } from "../utils/models";
import { isValidCoordinate } from "../utils/geolocation";
import { socket } from "../utils/socket-io";

export default function useMapDriver({ route_id, start_location, end_location }: MapDriverProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useMap(mapContainerRef);


  const handleNewPoints = async (data: { route_id: string; lat: number; lng: number }) => {
    console.log("Novos pontos recebidos:", data);

    if (!map) {
      console.error("Mapa não inicializado.");
      return;
    }

    
    if (!map.hasRoute(data.route_id)) {
      console.log(`Rota ${data.route_id} não encontrada. Adicionando ao mapa...`);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/routes/${data.route_id}`);
        if (!response.ok) throw new Error(`Erro ao buscar rota ${data.route_id}: ${response.statusText}`);

        const route = await response.json();
        

        map.addRouteWithIcons({
          routeId: data.route_id,
          startMarkerOptions: {
            position: route.directions.routes[0].legs[0].start_location,
          },
          endMarkerOptions: {
            position: route.directions.routes[0].legs[0].end_location,
          },
          carMarkerOptions: {
            position: route.directions.routes[0].legs[0].start_location,
          },
        });
      } catch (error) {
        console.error(`Erro ao adicionar rota ${data.route_id}:`, error);
        return;
      }
    }

    map.moveCar(data.route_id, { lat: data.lat, lng: data.lng });
  };

  useEffect(() => {
    if (!map) {
      console.log("Mapa ainda não foi inicializado.");
      return;
    }

    // Valida os dados de entrada
    if (
      !route_id ||
      !start_location ||
      !end_location ||
      !isValidCoordinate(start_location) ||
      !isValidCoordinate(end_location)
    ) {
      console.error("Dados inválidos.");
      return;
    }

    if (socket.disconnected) {
      socket.connect();
      console.log("Conectado ao WebSocket.");
    }

    const eventName = `server:new-points/${route_id}:list`;
    socket.on(eventName, handleNewPoints);

    socket.emit("client:new-points", { route_id });

    return () => {
      console.log("Removendo listener do WebSocket...");
      socket.off(eventName, handleNewPoints); 
    };
  }, [route_id, start_location, end_location, map]);

  return mapContainerRef
}