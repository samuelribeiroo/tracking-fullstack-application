import { Loader } from "@googlemaps/js-api-loader";
import { useEffect, useState } from "react";
import { Map } from "../utils/map";
import { getCurrentPosition } from "../utils/geolocation";


export function useMap(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [map, setMap] = useState<Map>();

  useEffect(() => {
    (async () => {
      if (!containerRef.current) return;
      
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        libraries: ["routes", "geometry", "marker"],
      });
      const [, , , position] = await Promise.all([
        loader.importLibrary("routes"),
        loader.importLibrary("geometry"),
        loader.importLibrary("marker"),
        getCurrentPosition({ enableHighAccuracy: true }),
      ]);

  
      const map = new Map(containerRef.current, {
        mapId: "cf26281cdd8eccb9", // Theme ID created at Google Cloud Platform
        zoom: 15,
        center: position,
        backgroundColor: '#1a1a1a'
      });
      setMap(map);
    })();
  }, [containerRef]);

  return map;
}