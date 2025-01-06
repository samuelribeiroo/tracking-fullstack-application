"use client";

import Map from "@/src/components/ui/map";
import { useMap } from "@/src/hooks/useMap";
import { socket } from "@/src/utils/socket-io";
import { useEffect, useRef } from "react";

export type MapDriverProps = {
  route_id: string | null;
};

export function MapDriver({ route_id }: MapDriverProps) {
  const mapContainerRef = useRef<any>(null);
  const map = useMap(mapContainerRef);

  useEffect(() => {
    if (!map || !route_id) return;

 
    if (socket.disconnected) socket.connect();

    
    const eventName = `server:new-points/${route_id}:list`;
    socket.on(eventName, (receivedData: any) => {
      console.log("Dados recebidos:", receivedData);
    });

    socket.emit("client:new-points", { route_id });

    return () => {
      socket.off(eventName);
    };
  }, [route_id, map]);

  return <Map ref={mapContainerRef}/>
}
