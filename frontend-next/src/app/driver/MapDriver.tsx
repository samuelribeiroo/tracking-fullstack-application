"use client"

import { forwardRef } from "react";
import Map from "@/src/components/ui/map";
import { MapDriverProps } from "@/src/utils/models";
import { useMap } from "@/src/hooks/useMap";
import useMapDriver from "@/src/hooks/useMapDriver";


const MapDriver = forwardRef<HTMLDivElement, MapDriverProps>((props, ref) => {
  const mapContainerRef = useMapDriver(props);

  return <Map ref={ref || mapContainerRef} />;
});

MapDriver.displayName = "MapDriver";

export default MapDriver;