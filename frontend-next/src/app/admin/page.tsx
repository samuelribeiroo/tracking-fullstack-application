'use client'

import Map from "@/src/components/ui/map";
import { useMap } from "@/src/hooks/useMap";
import { useEffect, useRef } from "react";


export default function AdminPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  useMap(mapContainerRef);
  
  return <Map ref={mapContainerRef}/>
  
}