// import { sample, shuffle } from "loadash";
import type { DirectionsResponseData } from "@googlemaps/google-maps-services-js";


export class MapRouteExistsError extends Error {}

interface MarkerDirectOptions {
  startMarkerOptions: google.maps.marker.AdvancedMarkerElementOptions;
  endMarkerOptions: google.maps.marker.AdvancedMarkerElementOptions;
  carMarkerOptions: google.maps.marker.AdvancedMarkerElementOptions;
}

export class MapRoute {
  public startMarker: google.maps.marker.AdvancedMarkerElement;
  public endMarker: google.maps.marker.AdvancedMarkerElement;
  public carMarker: google.maps.marker.AdvancedMarkerElement;

  public directionsRenderer: google.maps.DirectionsRenderer;

  private createDirectionMarker(
    options: google.maps.marker.AdvancedMarkerElementOptions
  ): google.maps.marker.AdvancedMarkerElement {
    return new google.maps.marker.AdvancedMarkerElement(options);
  }

  constructor(option: MarkerDirectOptions) {
    const { startMarkerOptions, endMarkerOptions, carMarkerOptions } = option;

    this.startMarker = this.createDirectionMarker(startMarkerOptions);
    this.endMarker = this.createDirectionMarker(endMarkerOptions);
    this.carMarker = this.createDirectionMarker(carMarkerOptions);

    const svg = this.startMarker.content as SVGAElement;
    if (!svg) throw new Error("SVG Inválido.");

    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: svg.getAttribute("fill"),
        strokeOpacity: 0.5,
        strokeWeight: 5,
      },
    });
    this.directionsRenderer.setMap(this.startMarker.map as google.maps.Map);
  }

  async calculateRoute(
    directionsResponseData?: DirectionsResponseData & { request: any }
  ) {
    if (directionsResponseData) {
      const directionsResult = convertDirectionsResponseToDirectionsResult(
        directionsResponseData
      );
      this.directionsRenderer.setDirections(directionsResult);
      return;
    }

    const startPosition = this.startMarker.position as google.maps.LatLng;
    const endPosition = this.endMarker.position as google.maps.LatLng;

    const result = await new google.maps.DirectionsService().route({
      origin: startPosition,
      destination: endPosition,
      travelMode: google.maps.TravelMode.DRIVING,
    });

    this.directionsRenderer.setDirections(result);
  }

  delete() {
    this.startMarker.map = null
    this.endMarker.map = null
    this.carMarker.map = null

    this.directionsRenderer.setMap(null)
  }
}

function convertDirectionsResponseToDirectionsResult(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  directionsResponse: DirectionsResponseData & { request: any }
): google.maps.DirectionsResult {
  const copy = { ...directionsResponse };

  return {
    available_travel_modes:
      copy.available_travel_modes as google.maps.TravelMode[],
    geocoded_waypoints: copy.geocoded_waypoints,
    status: copy.status,
    request: copy.request,
    //@ts-expect-error - types are incorrect
    routes: copy.routes.map((route) => {
      const bounds = new google.maps.LatLngBounds(
        route.bounds.southwest,
        route.bounds.northeast
      );
      return {
        bounds,
        overview_path: google.maps.geometry.encoding.decodePath(
          route.overview_polyline.points
        ),
        overview_polyline: route.overview_polyline,
        warnings: route.warnings,
        copyrights: route.copyrights,
        summary: route.summary,
        waypoint_order: route.waypoint_order,
        fare: route.fare,
        legs: route.legs.map((leg) => ({
          ...leg,
          start_location: new google.maps.LatLng(
            leg.start_location.lat,
            leg.start_location.lng
          ),
          end_location: new google.maps.LatLng(
            leg.end_location.lat,
            leg.end_location.lng
          ),
          steps: leg.steps.map((step) => ({
            path: google.maps.geometry.encoding.decodePath(
              step.polyline.points
            ),
            start_location: new google.maps.LatLng(
              step.start_location.lat,
              step.start_location.lng
            ),
          })),
        })),
      };
    }),
  };
}
