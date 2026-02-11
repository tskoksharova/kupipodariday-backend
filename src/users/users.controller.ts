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

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    const userId = (req.user as any).id;
    const user = await this.usersService.findById(userId);
    return this.usersService.toMeProfile(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: Request, @Body() dto: UpdateUserDto) {
    const userId = (req.user as any).id;
    const updated = await this.usersService.updateById(userId, dto as any);
    return this.usersService.toMeProfile(updated);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/wishes')
  async getMyWishes(@Req() req: Request) {
    const userId = (req.user as any).id;
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
