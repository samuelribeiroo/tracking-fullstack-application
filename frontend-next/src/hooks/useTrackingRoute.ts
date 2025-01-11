import { useState, useEffect } from "react";
import { socket } from "../utils/socket-io";

export default function useTrackRoute() {
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [routeId, setRouteId] = useState<string | null>(null); 


  const trackStartedRoute = async (routeId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/routes/${routeId}`);
      if (!response.ok) throw new Error(`Erro ao buscar detalhes da rota ${routeId}`);

      const route = await response.json();
      console.log(`Detalhes da rota ${routeId} recebidos:`, route);
      setRouteDetails(route); 


      const eventName = `server:new-points/${routeId}:list`;
      socket.on(eventName, async (data: { route_id: string; lat: number; lng: number }) => {
        console.log("Novos pontos recebidos na página Admin:", data);
        // GMaps will be displayed here logic
      });

      
      socket.emit("client:new-points", { route_id: routeId });
    } catch (error) {
      console.error("Erro ao iniciar o rastreamento da rota:", error);
    }
  };

  useEffect(() => {
   
    if (socket.disconnected) {
      socket.connect();
      console.log("Conectado ao WebSocket.");
    }

    const handleRouteStarted = (data: { route_id: string }) => {
      console.log("Nova rota iniciada recebida:", data.route_id);
      setRouteId(data.route_id); 
    };

    socket.on("server:route-started", handleRouteStarted);

   
    return () => {
      console.log("Removendo listener do WebSocket na página Admin...");
      socket.off("server:route-started", handleRouteStarted); // Remove o listener
    };
  }, []);

  useEffect(() => { if (routeId) trackStartedRoute(routeId); }, [routeId])

  return {
    routeDetails, routeId
  }
}