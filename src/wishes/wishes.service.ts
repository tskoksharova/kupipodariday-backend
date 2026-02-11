import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Wish } from './entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { UpdateWishDto } from './dto/update-wish.dto';
import { CreateWishDto } from './dto/create-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish) private readonly wishesRepo: Repository<Wish>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async create(ownerId: number, dto: CreateWishDto): Promise<Wish> {
    const owner = await this.usersRepo.findOne({ where: { id: ownerId } });
    if (!owner) throw new NotFoundException('Пользователь не найден');

    const wish = this.wishesRepo.create({
      ...dto,
      owner,
      raised: 0,
      copied: 0,
    });

    return this.wishesRepo.save(wish);
  }

  async findOneOrFail(id: number): Promise<Wish> {
    const wish = await this.wishesRepo.findOne({
      where: { id },
      relations: { owner: true, offers: { user: true } },
    });
    if (!wish) throw new NotFoundException('Подарок не найден');
    return wish;
  }

  async findLast(): Promise<Wish[]> {
    return this.wishesRepo.find({
      order: { createdAt: 'DESC' },
      take: 40,
      relations: { owner: true, offers: { user: true } },
    });
  }

  async findTop(): Promise<Wish[]> {
    return this.wishesRepo.find({
      order: { copied: 'DESC' },
      take: 20,
      relations: { owner: true, offers: { user: true } },
    });
  }

  async findByOwnerId(ownerId: number): Promise<Wish[]> {
    return this.wishesRepo.find({
      where: { owner: { id: ownerId } },
      relations: { owner: true, offers: { user: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async findByOwnerUsername(username: string): Promise<Wish[]> {
    return this.wishesRepo.find({
      where: { owner: { username } },
      relations: { owner: true, offers: { user: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async updateOne(
    id: number,
    ownerId: number,
    dto: UpdateWishDto,
  ): Promise<Wish> {
    const wish = await this.wishesRepo.findOne({
      where: { id },
      relations: { owner: true, offers: true },
    });
    if (!wish) throw new NotFoundException('Подарок не найден');

    if (wish.owner.id !== ownerId)
      throw new ForbiddenException('Нельзя менять чужой подарок');

    if (dto.price !== undefined && wish.offers && wish.offers.length > 0) {
      throw new BadRequestException(
        'Нельзя менять стоимость, если уже есть желающие скинуться',
      );
    }

    Object.assign(wish, dto);
    return this.wishesRepo.save(wish);
  }

  async removeOne(id: number, ownerId: number): Promise<Wish> {
    const wish = await this.wishesRepo.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (!wish) throw new NotFoundException('Подарок не найден');

    if (wish.owner.id !== ownerId)
      throw new ForbiddenException('Нельзя удалять чужой подарок');

    await this.wishesRepo.remove(wish);
    return wish;
  }

  async copyWish(id: number, newOwnerId: number): Promise<Wish> {
    const wish = await this.wishesRepo.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (!wish) throw new NotFoundException('Подарок не найден');

    const newOwner = await this.usersRepo.findOne({
      where: { id: newOwnerId },
    });
    if (!newOwner) throw new NotFoundException('Пользователь не найден');

    wish.copied = (wish.copied ?? 0) + 1;
    await this.wishesRepo.save(wish);

    const copiedWish = this.wishesRepo.create({
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      description: wish.description,
      owner: newOwner,
      raised: 0,
      copied: 0,
    });

    return this.wishesRepo.save(copiedWish);
  }

  async findAll(): Promise<Wish[]> {
    return this.wishesRepo.find({
      order: { createdAt: 'DESC' },
      relations: { owner: true, offers: { user: true } },
    });
  }
  async findByIdWithOwner(id: number): Promise<Wish> {
    const wish = await this.wishesRepo.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (!wish) throw new NotFoundException('Подарок не найден');
    return wish;
  }

  async setRaised(id: number, raised: number): Promise<void> {
    await this.wishesRepo.update({ id }, { raised });
  }
}
