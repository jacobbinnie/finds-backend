import { Controller, Get, Logger, Param, UseGuards } from '@nestjs/common';
import { PlacesService } from './places.service';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { PlaceWithFindsDto } from './dto/placeWithFinds.dto';

@ApiTags('places')
@Controller('place')
export class PlacesController {
  logger: Logger;

  constructor(private readonly placesService: PlacesService) {
    this.logger = new Logger();
  }

  // @UseGuards(JwtGuard)
  @Get(':id')
  async getPlaceByGoogleId(
    @Param('id') id: string,
  ): Promise<PlaceWithFindsDto> {
    return this.placesService.getPlaceByGoogleId(id);
  }
}
