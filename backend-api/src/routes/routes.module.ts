import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DirectionsService } from 'src/maps/directions/directions.service';
import { MapsModule } from 'src/maps/maps.module';

@Module({
  imports: [MapsModule],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
