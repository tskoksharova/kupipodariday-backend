import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

type RequestWithUserId = Request & { user: { id: number } };

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Get('last')
  findLast() {
    return this.wishesService.findLast();
  }

  @Get('top')
  findTop() {
    return this.wishesService.findTop();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: RequestWithUserId, @Body() dto: CreateWishDto) {
    const userId = req.user.id;
    return this.wishesService.create(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.wishesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wishesService.findOneOrFail(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateOne(
    @Req() req: RequestWithUserId,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWishDto,
  ) {
    const userId = req.user.id;
    return this.wishesService.updateOne(id, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  removeOne(
    @Req() req: RequestWithUserId,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user.id;
    return this.wishesService.removeOne(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/copy')
  copy(@Req() req: RequestWithUserId, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.id;
    return this.wishesService.copyWish(id, userId);
  }
}
