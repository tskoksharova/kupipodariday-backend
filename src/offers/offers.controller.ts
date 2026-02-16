import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OffersService } from './offers.service';

type RequestWithUserId = Request & { user: { id: number } };

@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  async create(@Req() req: RequestWithUserId, @Body() dto: CreateOfferDto) {
    const userId = req.user.id;
    return this.offersService.create(userId, dto);
  }

  @Get()
  async findAll() {
    return this.offersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.offersService.findOneOrFail(Number(id));
  }
}
