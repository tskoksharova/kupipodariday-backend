import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WishlistlistsService } from './wishlistlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { WishlistResponseDto } from './dto/wishlist-response.dto';

type RequestWithUserId = Request & { user: { id: number } };

@Controller('wishlistlists')
export class WishlistlistsController {
  constructor(private readonly wishlistlistsService: WishlistlistsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    const list = await this.wishlistlistsService.findAll();
    return list.map(WishlistResponseDto.fromEntity);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: RequestWithUserId, @Body() dto: CreateWishlistDto) {
    const userId = req.user.id;
    const wl = await this.wishlistlistsService.create(userId, dto);
    return WishlistResponseDto.fromEntity(wl);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const wl = await this.wishlistlistsService.findOneOrFail(Number(id));
    return WishlistResponseDto.fromEntity(wl);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateOne(
    @Req() req: RequestWithUserId,
    @Param('id') id: string,
    @Body() dto: UpdateWishlistDto,
  ) {
    const userId = req.user.id;
    const wl = await this.wishlistlistsService.updateOne(
      Number(id),
      userId,
      dto,
    );
    return WishlistResponseDto.fromEntity(wl);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeOne(@Req() req: RequestWithUserId, @Param('id') id: string) {
    const userId = req.user.id;
    const wl = await this.wishlistlistsService.removeOne(Number(id), userId);
    return WishlistResponseDto.fromEntity(wl);
  }
}
