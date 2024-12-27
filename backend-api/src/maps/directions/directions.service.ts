import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: <explanation>
import {
  DirectionsRequest,
  Client as GoogleMapsClient,
  PlaceInputType,
  TravelMode,
} from '@googlemaps/google-maps-services-js';
import { env } from '../../env';

@Injectable()
export class DirectionsService {
  constructor(private readonly googleMapsClient: GoogleMapsClient) {}

  async getDirectionsService(originId: string, destinationId: string) {
    try {
      const requestParams: DirectionsRequest['params'] = {
        origin: `place_id:${originId}`,
        destination: `place_id:${destinationId}`,
        mode: TravelMode.driving,
        key: env.GOOGLE_MAPS_API_KEY,
      };

      const { data } = await this.googleMapsClient.directions({
          params: requestParams,
        })
        .catch(error => {
          throw new HttpException(
            'ID de origem ou de destino inválido.',
            HttpStatus.BAD_REQUEST,
          );
        });

      return {
        ...data,
        request: {
          origin: {
            place_id: requestParams.origin,
            location: {
              lat: data.routes[0].legs[0].start_location.lat,
              lng: data.routes[0].legs[0].start_location.lng,
            },
          },
          destination: {
            place_id: requestParams.destination,
            location: {
              lat: data.routes[0].legs[0].end_location.lat,
              lng: data.routes[0].legs[0].end_location.lng,
            },
          },
          mode: requestParams.mode,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException('Invalid request parameters', HttpStatus.BAD_REQUEST);
    }
  }
}