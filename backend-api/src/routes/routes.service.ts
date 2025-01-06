import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
// biome-ignore lint/style/useImportType: <explanation>
import { CreateRouteDto } from './dto/create-route.dto';
// biome-ignore lint/style/useImportType: <explanation>
import { UpdateRouteDto } from './dto/update-route.dto';
// biome-ignore lint/style/useImportType: <explanation>
import { PrismaService } from 'src/prisma/prisma.service';
// biome-ignore lint/style/useImportType: <explanation>
import { DirectionsService } from 'src/maps/directions/directions.service';

@Injectable()
export class RoutesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly directionsService: DirectionsService,
  ) {}

  async create({ source_id, name, destination_id }: CreateRouteDto) {
    try {
      const sourceId = source_id ? String(source_id).trim() : null;
      const destinationId = destination_id
        ? String(destination_id).trim()
        : null;

      if (!sourceId || !destinationId)
        throw new HttpException(
          'Os IDs de origem e destino são obrigatórios!',
          HttpStatus.BAD_REQUEST,
        );

      const { available_travel_modes, geocoded_waypoints, routes, request } =
        await this.directionsService.getDirectionsService(
          sourceId,
          destinationId,
        );

      const legs = routes[0].legs[0];

      const createRoute = await this.prismaService.route.create({
        data: {
          name: name,
          source: {
            name: legs.start_address,
            location: {
              lat: legs.start_location.lat,
              lng: legs.start_location.lng,
            },
          },

          destination: {
            name: legs.end_address,
            location: {
              lat: legs.end_location.lat,
              lng: legs.end_location.lng,
            },
          },
          duration: legs.duration.value,
          distance: legs.distance.value,
          directions: JSON.parse(
            JSON.stringify({
              available_travel_modes,
              geocoded_waypoints,
              routes,
              request,
            }),
          ),
        },
      });

      return createRoute;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        'Erro interno no servidor ao criar a rota',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async startRoute(id: string): Promise<{ sucess: Boolean }> {
    try {
      const findUniqueRoute = await this.prismaService.route.findFirstOrThrow({
        where: { id },
      });

      if (!findUniqueRoute)
        throw new HttpException(
          'Rota solicitada não encontrada',
          HttpStatus.NOT_FOUND,
        );

      return { sucess: true };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        'Erro interno no servidor ao criar a rota',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAll() {
    return this.prismaService.route.findMany();
  }

  findOne(id: string) {
    return this.prismaService.route.findFirstOrThrow({ where: { id } });
  }

  update(id: number, updateRouteDto: UpdateRouteDto) {
    return `This action updates a #${id} route`;
  }

  remove(id: number) {
    return `This action removes a #${id} route`;
  }
}
