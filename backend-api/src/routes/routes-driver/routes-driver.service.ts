import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: <explanation>
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoutesDriverService {
  constructor(private readonly prismaService: PrismaService) {}

  async processRoute(dto: { route_id: string; lat: number; lng: number }) {
   try {
    const routeId = dto.route_id ? String(dto.route_id) : null
    const coordLat = dto.lat ? Number(dto.lat) : null
    const coordLong = dto.lng ? Number(dto.lng) : null

    if (!routeId || !coordLat ||coordLong) throw new HttpException( 'Informações obrigatórias!', HttpStatus.BAD_REQUEST);
    

    const routeDriver = await this.prismaService.routeDriver.upsert({
      include: { route: true } /* Eager Loading Technique */,
      where: { route_id: routeId },
      create: {
        route_id: routeId,
        points: {
          set: {
            location: {
              lat: coordLat,
              lng: coordLong,
            },
          },
        },
      },
      update: {
        points: {
          push: {
            location: {
              lat: coordLat,
              lng: coordLong,
            },
          },
        },
      },
    }).catch(error => {
      throw new HttpException(`Falha ao calcular a rota do motorista: ${error}`, HttpStatus.BAD_REQUEST)
    });

    return routeDriver;
   } catch (error) {
    if (error instanceof HttpException) throw error;
      
    throw new HttpException('Erro interno no servidor ao criar a rota', HttpStatus.INTERNAL_SERVER_ERROR);
   }
  }
}
