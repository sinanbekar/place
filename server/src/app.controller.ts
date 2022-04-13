import { Controller, Get, Res } from '@nestjs/common';
import { PlaceService } from './place.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly placeService: PlaceService) {
    this.placeService = placeService;
  }

  @Get('/place.png')
  async getPlace(@Res() res: Response) {
    res.contentType('image/png');
    res.send(await this.placeService.getCanvasBuffer());
  }
}
