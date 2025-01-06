import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: <explanation>
import { RoutesService } from './routes.service';
// biome-ignore lint/style/useImportType: <explanation>
import { CreateRouteDto } from './dto/create-route.dto';
// biome-ignore lint/style/useImportType: <explanation>
import { UpdateRouteDto } from './dto/update-route.dto';
import { RoutesDriverService } from './routes-driver/routes-driver.service';

@Controller('routes')
export class RoutesController {
  constructor(
    private readonly routesService: RoutesService,
    private readonly routeDriverService: RoutesDriverService,
  ) {}

  @Post()
  create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto);
  }

  @Post(':id/process-route')
  processRoute(
    @Param('id') id: string,
    @Body() data: { lat: number; lng: number },
  ) {
    return this.routeDriverService.processRoute({
      route_id: id,
      lat: data.lat,
      lng: data.lng,
    });
  }

  @Post(':id/start')
  startRoute(@Param('id') id: string) {
    return this.routesService.startRoute(id);
  }

  @Get()
  findAll() {
    return this.routesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRouteDto: UpdateRouteDto) {
    return this.routesService.update(+id, updateRouteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.routesService.remove(+id);
  }
}
