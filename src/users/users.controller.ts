import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { WishesService } from '../wishes/wishes.service';

type RequestWithUserId = Request & { user: { id: number } };

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: RequestWithUserId) {
    const userId = req.user.id;
    const user = await this.usersService.findmeById(userId);
    return this.usersService.toMeProfile(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: RequestWithUserId, @Body() dto: UpdateUserDto) {
    const userId = req.user.id;
    const updated = await this.usersService.updateById(userId, dto);
    return this.usersService.toMeProfile(updated);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/wishes')
  async getMyWishes(@Req() req: RequestWithUserId) {
    const userId = req.user.id;
    return this.wishesService.findByOwnerId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('find')
  async findUsers(@Body() dto: FindUsersDto) {
    const users = await this.usersService.findMany(dto.query);
    return users.map((u) => this.usersService.toPublicProfile(u));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':username')
  async getUserByUsername(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('Пользователь не найден');
    return this.usersService.toPublicProfile(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':username/wishes')
  async getUserWishes(@Param('username') username: string) {
    return this.wishesService.findByOwnerUsername(username);
  }
}
