"use client";

import useTrackRoute from "@/src/hooks/useTrackingRoute";
import MapDriver from "../driver/MapDriver";

export default function AdminPage() {
  const { routeDetails, routeId } = useTrackRoute();

  const start_location =
    routeDetails?.directions?.routes[0]?.legs[0]?.start_location;
  const end_location =
    routeDetails?.directions?.routes[0]?.legs[0]?.end_location;

  return (
    <MapDriver
      route_id={routeId}
      start_location={start_location}
      end_location={end_location}
    />
  );
}
