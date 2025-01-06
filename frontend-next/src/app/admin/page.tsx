'use client'

import { useMap } from "@/src/hooks/useMap";
import { useEffect, useRef } from "react";


export default function AdminPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  useMap(mapContainerRef);
  
  return <div
    className="min-w-[300px] max-h-[800px] 
    sm:min-h-[900px] sm:max-h-[600px] 
    md:min-h-[700px] md:max-h-[500px] 
    lg:min-h-[500px] lg:max-h-[400px] 
    xl:min-h-[400px] xl:max-h-[300px]"
    ref={mapContainerRef}
    style={{ minHeight: "1200px", minWidth: "300px" }}
  />
  
}