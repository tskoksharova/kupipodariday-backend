import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Wishlist } from './entities/wishlist.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistsRepo: Repository<Wishlist>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Wish) private readonly wishesRepo: Repository<Wish>,
  ) {}

  async create(ownerId: number, dto: CreateWishlistDto): Promise<Wishlist> {
    const owner = await this.usersRepo.findOne({ where: { id: ownerId } });
    if (!owner) throw new NotFoundException('Пользователь не найден');

    const items = dto.itemsId?.length
      ? await this.wishesRepo.find({ where: { id: In(dto.itemsId) } })
      : [];

    const wl = this.wishlistsRepo.create({
      name: dto.name,
      description: dto.description ?? '',
      image: dto.image ?? '',
      owner,
      items,
    });

    const saved = await this.wishlistsRepo.save(wl);
    return this.findOneOrFail(saved.id);
  }

  async findAll(): Promise<Wishlist[]> {
    return this.wishlistsRepo.find({
      order: { createdAt: 'DESC' },
      relations: { owner: true, items: true },
    });
  }

  async findOneOrFail(id: number): Promise<Wishlist> {
    const wl = await this.wishlistsRepo.findOne({
      where: { id },
      relations: { owner: true, items: true },
    });
    if (!wl) throw new NotFoundException('Подборка не найдена');
    return wl;
  }

  async updateOne(
    id: number,
    ownerId: number,
    dto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    const wl = await this.wishlistsRepo.findOne({
      where: { id },
      relations: { owner: true, items: true },
    });
    if (!wl) throw new NotFoundException('Подборка не найдена');

    if (wl.owner.id !== ownerId) {
      throw new ForbiddenException('Нельзя редактировать чужую подборку');
    }

    if (dto.name !== undefined) wl.name = dto.name;
    if (dto.description !== undefined) wl.description = dto.description;
    if (dto.image !== undefined) wl.image = dto.image;

    if (dto.itemsId !== undefined) {
      wl.items = dto.itemsId.length
        ? await this.wishesRepo.find({ where: { id: In(dto.itemsId) } })
        : [];
    }

    await this.wishlistsRepo.save(wl);
    return this.findOneOrFail(id);
  }

  async removeOne(id: number, ownerId: number): Promise<Wishlist> {
    const wl = await this.wishlistsRepo.findOne({
      where: { id },
      relations: { owner: true, items: true },
    });
    if (!wl) throw new NotFoundException('Подборка не найдена');

    if (wl.owner.id !== ownerId) {
      throw new ForbiddenException('Нельзя удалять чужую подборку');
    }

    await this.wishlistsRepo.remove(wl);
    return wl;
  }
}
