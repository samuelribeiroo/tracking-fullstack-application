import { Module, forwardRef } from '@nestjs/common';
import { PlacesService } from './places/places.service';
import { PlacesController } from './places/places.controller';
import { AppModule } from 'src/app.module';
import { Client as GoogleMapsClient } from '@googlemaps/google-maps-services-js';

@Module({
  imports: [forwardRef(() => AppModule)],
  controllers: [PlacesController],
  providers: [
    PlacesService,
    {
      provide: GoogleMapsClient,
      useValue: new GoogleMapsClient(),
    },
  ],
  exports: [PlacesService],
})
export class MapsModule {}
