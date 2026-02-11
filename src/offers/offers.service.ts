import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Offer } from './entities/offer.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer) private readonly offersRepo: Repository<Offer>,
    @InjectRepository(Wish) private readonly wishesRepo: Repository<Wish>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async create(userId: number, dto: CreateOfferDto): Promise<Offer> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');

    const wish = await this.wishesRepo.findOne({
      where: { id: dto.itemId },
      relations: { owner: true },
    });
    if (!wish) throw new NotFoundException('Подарок не найден');

    if (wish.owner?.id === userId) {
      throw new ForbiddenException('Нельзя скинуться на собственный подарок');
    }

    const price = Number(wish.price ?? 0);
    const raised = Number(wish.raised ?? 0);
    const amount = Number(dto.amount ?? 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Сумма должна быть больше нуля');
    }

    if (raised >= price) {
      throw new BadRequestException('На этот подарок уже собраны деньги');
    }

    if (raised + amount > price) {
      throw new BadRequestException(
        'Сумма собранных средств не может превышать стоимость подарка',
      );
    }

    const offer = this.offersRepo.create({
      user,
      item: wish,
      amount,
      hidden: dto.hidden ?? false,
    });

    const savedOffer = await this.offersRepo.save(offer);

    wish.raised = raised + amount;
    await this.wishesRepo.save(wish);

    return this.offersRepo.findOneOrFail({
      where: { id: savedOffer.id },
      relations: { user: true, item: { owner: true } },
    });
  }

  async findAll(): Promise<Offer[]> {
    return this.offersRepo.find({
      order: { createdAt: 'DESC' },
      relations: { user: true, item: { owner: true } },
    });
  }

  async findOneOrFail(id: number): Promise<Offer> {
    const offer = await this.offersRepo.findOne({
      where: { id },
      relations: { user: true, item: { owner: true } },
    });
    if (!offer) throw new NotFoundException('Заявка не найдена');
    return offer;
  }
}
