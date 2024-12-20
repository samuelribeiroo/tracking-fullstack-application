import { Injectable } from '@nestjs/common';
import { DirectionsRequest, Client as GoogleMapsClient, PlaceInputType, TravelMode } from '@googlemaps/google-maps-services-js';
import { env } from "../../env";

@Injectable()
export class DirectionsService {
  constructor(private readonly googleMapsClient: GoogleMapsClient) {};
   

  async getDirectionsService(originId: string, destinationId: string) {
    const requestParams: DirectionsRequest['params'] = {
      origin: `place_id:${originId}`,
      destination: `place_id:${destinationId}`,
      mode: TravelMode.driving,
      key: env.GOOGLE_MAPS_API_KEY
    }
    
    const { data } = await this.googleMapsClient.directions({
      params: requestParams
    })

 
    return {
      ...data,
      request: {
        origind: {
          place_id: requestParams.origin,
          location: {
            lat: data.routes[0].legs[0].start_location.lat,
            lng: data.routes[0].legs[0].start_location.lng
          }
        },
        destination: {
          place_id: requestParams.origin,
          location: {
            lat: 0,
            lng: 0
          }
        },
        mode: requestParams.mode
      }
    }
  }
}

// oriin: "place_id": "ChIJRdds9Ulb65QRJKO4OU0p8mU"

// destination: "place_id": "ChIJ-4waVlRD65QRfFez2zMTnkM"