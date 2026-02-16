import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { DEFAULT_ABOUT, DEFAULT_AVATAR } from '../common/constants/defaults';
import { UserPublicProfileResponseDto } from './dto/user-public-profile-response.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type CreateUserPayload = {
  username: string;
  email: string;
  password: string;
  about?: string;
  avatar?: string;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async create(payload: CreateUserPayload): Promise<User> {
    const exists = await this.usersRepo.findOne({
      where: [{ username: payload.username }, { email: payload.email }],
      select: ['id'],
    });

    if (exists) {
      throw new ConflictException(
        'Пользователь с таким email или username уже существует',
      );
    }

    const hash = await bcrypt.hash(payload.password, 10);

    const user = this.usersRepo.create({
      username: payload.username,
      email: payload.email,
      password: hash,
      about: payload.about?.trim() ? payload.about.trim() : DEFAULT_ABOUT,
      avatar: payload.avatar?.trim() ? payload.avatar.trim() : DEFAULT_AVATAR,
    });

    const saved = await this.usersRepo.save(user);

    return this.usersRepo.findOneOrFail({ where: { id: saved.id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { username } });
  }

  async findByUsernameWithPassword(username: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: { username },
      select: [
        'id',
        'username',
        'email',
        'about',
        'avatar',
        'createdAt',
        'updatedAt',
        'password',
      ],
    });
  }

  async findmeById(id: number): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  async findMany(query: string): Promise<User[]> {
    const where: FindOptionsWhere<User>[] = [
      { email: ILike(`%${query}%`) },
      { username: ILike(`%${query}%`) },
    ];

    return this.usersRepo.find({ where });
  }

  async updateById(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'about', 'avatar', 'password'],
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    const nextUsername =
      dto.username !== undefined ? dto.username.trim() : undefined;
    const nextEmail = dto.email !== undefined ? dto.email.trim() : undefined;
    const nextAbout = dto.about !== undefined ? dto.about.trim() : undefined;
    const nextAvatar = dto.avatar !== undefined ? dto.avatar.trim() : undefined;

    if (dto.username !== undefined)
      user.username = nextUsername || user.username;
    if (dto.email !== undefined) user.email = nextEmail || user.email;

    if (dto.about !== undefined) user.about = nextAbout || DEFAULT_ABOUT;
    if (dto.avatar !== undefined) user.avatar = nextAvatar || DEFAULT_AVATAR;

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.username !== undefined || dto.email !== undefined) {
      const conflict = await this.usersRepo
        .createQueryBuilder('u')
        .select(['u.id'])
        .where('(u.username = :username OR u.email = :email)', {
          username: user.username,
          email: user.email,
        })
        .andWhere('u.id != :id', { id })
        .getOne();

      if (conflict) {
        throw new ConflictException(
          'Пользователь с таким email или username уже существует',
        );
      }
    }

    const saved = await this.usersRepo.save(user);

    return this.usersRepo.findOneOrFail({ where: { id: saved.id } });
  }

  toPublicProfile(user: User): UserPublicProfileResponseDto {
    return UserPublicProfileResponseDto.fromEntity(user);
  }

  toMeProfile(user: User): UserProfileResponseDto {
    return UserProfileResponseDto.fromEntity(user);
  }
}
