import { Injectable, Query } from '@nestjs/common';
// biome-ignore lint/style/useImportType: <explicação opcional>
import { Client as GoogleMapsClient, PlaceInputType } from '@googlemaps/google-maps-services-js';
import { env } from "../../env";

@Injectable()
export class PlacesService {
  constructor(private readonly googleMapsClient: GoogleMapsClient) {}

  async findPlaces(text: string) {
    const { data } = await this.googleMapsClient.findPlaceFromText({
      params: {
        input: text,
        inputtype: PlaceInputType.textQuery,
        fields: ['place_id', 'geometry', 'formatted_address', 'name'],
        key: env.GOOGLE_MAPS_API_KEY
      }
    })

    return data
  }
}
