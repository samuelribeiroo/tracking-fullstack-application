import { sample, shuffle} from "lodash";
import type { DirectionsResponseData } from "@googlemaps/google-maps-services-js";


export class Map {
  public map: google.maps.Map;
  private routes: { [routeId: string]: MapRoute } = {};

  constructor(element: HTMLElement, options: google.maps.MapOptions) {
    this.map = new google.maps.Map(element, {
      ...options,
      /*styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
      ],*/
    });
  }

  async addRoute(routeOptions: {
    routeId: string;
    startMarkerOptions: google.maps.marker.AdvancedMarkerElementOptions;
    endMarkerOptions: google.maps.marker.AdvancedMarkerElementOptions;
    carMarkerOptions: google.maps.marker.AdvancedMarkerElementOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    directionsResponseData?: DirectionsResponseData & { request: any };
  }) {
    if (routeOptions.routeId in this.routes) {
      throw new MapRouteExistsError();
    }

    const { startMarkerOptions, endMarkerOptions, carMarkerOptions } =
      routeOptions;

    const route = new MapRoute({
      startMarkerOptions: { ...startMarkerOptions, map: this.map },
      endMarkerOptions: { ...endMarkerOptions, map: this.map },
      carMarkerOptions: { ...carMarkerOptions, map: this.map },
    });
    this.routes[routeOptions.routeId] = route;

    await route.calculateRoute(routeOptions.directionsResponseData);

    this.fitBounds();
  }

  async addRouteWithIcons(routeOptions: {
    routeId: string;
    startMarkerOptions: Omit<
      google.maps.marker.AdvancedMarkerElementOptions,
      "icon"
    >;
    endMarkerOptions: Omit<
      google.maps.marker.AdvancedMarkerElementOptions,
      "icon"
    >;
    carMarkerOptions: Omit<
      google.maps.marker.AdvancedMarkerElementOptions,
      "icon"
    >;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    directionsResponseData?: DirectionsResponseData & { request: any };
  }) {
    const color = sample(shuffle(colors)) as string;
    return this.addRoute({
      ...routeOptions,
      startMarkerOptions: {
        ...routeOptions.startMarkerOptions,
        content: makeMarkerIcon(color),
      },
      endMarkerOptions: {
        ...routeOptions.endMarkerOptions,
        content: makeMarkerIcon(color),
      },
      carMarkerOptions: {
        ...routeOptions.carMarkerOptions,
        content: makeCarIcon(color),
      },
      directionsResponseData: routeOptions.directionsResponseData,
    });
  }

  private fitBounds() {
    const bounds = new google.maps.LatLngBounds();

    Object.keys(this.routes).forEach((id: string) => {
      const route = this.routes[id];
      bounds.extend(route.startMarker.position!);
      bounds.extend(route.endMarker.position!);
    });

    this.map.fitBounds(bounds);
  }

  moveCar(routeId: string, position: google.maps.LatLngLiteral) {
    this.routes[routeId].carMarker.position = {
      lat: position.lat,
      lng: position.lng,
    };
  }

  removeRoute(id: string) {
    if (!this.hasRoute(id)) {
      return;
    }
    const route = this.routes[id];
    route.delete();
    delete this.routes[id];
  }

  removeAllRoutes() {
    Object.keys(this.routes).forEach((id) => this.removeRoute(id));
  }

  hasRoute(id: string) {
    return id in this.routes;
  }

  getRoute(id: string) {
    return this.routes[id];
  }
}

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

export const makeCarIcon = (color: string) => {
  const div = document.createElement("div");
  div.style.position = "absolute";

  const svg = `
    <svg width="48" height="48" viewBox="0 0 48 48" fill="${color}" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(0.000000,48.000000) scale(0.100000,-0.100000)" fill="${color}" stroke="none">
        <path d="M300 375 c0 -12 -20 -15 -120 -15 -144 0 -144 0 -144 -130 0 -130 0 -130 144 -130 100 0 120 -3 120 -15 0 -8 5 -15 10 -15 6 0 10 7 10 15 0 11 12 15 49 15 33 0 56 6 72 18 20 17 22 27 22 112 0 85 -2 95 -22 112 -16 12 -39 18 -72 18 -37 0 -49 4 -49 15 0 8 -4 15 -10 15 -5 0 -10 -7 -10 -15z"/>
      </g>
    </svg>
  `;

 
  div.innerHTML = svg;

  return div;
};

export const makeMarkerIcon = (color: string) => {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "62");
  svg.setAttribute("height", "62");
  svg.setAttribute("viewBox", "0 0 92 92");
  svg.setAttribute("fill", color);

  const path = document.createElementNS(svgNS, "path");
  path.setAttribute(
    "d",
    "M66.9,41.8c0-11.3-9.1-20.4-20.4-20.4c-11.3,0-20.4,9.1-20.4,20.4c0,11.3,20.4,32.4,20.4,32.4S66.9,53.1,66.9,41.8z M37,41.4c0-5.2,4.3-9.5,9.5-9.5c5.2,0,9.5,4.2,9.5,9.5c0,5.2-4.2,9.5-9.5,9.5C41.3,50.9,37,46.6,37,41.4z"
  );
  path.setAttribute("stroke", color);
  path.setAttribute("stroke-opacity", "1");
  path.setAttribute("stroke-width", "1");
  path.setAttribute("fill-opacity", "1");

  svg.appendChild(path);

  return svg;
};

const colors = [
  "#FF5733", 
  "#33FF57", 
  "#3357FF", 
  "#FF33A1", 
  "#FFD700", 
  "#00FFFF", 
  "#FF8C00", 
  "#8A2BE2", 
  "#FF1493", 
  "#00FF7F", 
  "#FF4500", 
  "#7FFF00", 
  "#00CED1",
  "#FF69B4",
  "#8B008B",
  "#00BFFF", 
  "#FF6347",
];

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