import { Wish } from '../entities/wish.entity';
import { OfferResponseDto } from '../../offers/dto/offer-response.dto';

export class WishResponseDto {
  id: number;
  name: string;
  link: string;
  image: string;
  price: number;
  raised: number;
  copied: number;
  description: string;
  owner: any;
  offers: OfferResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(wish: Wish): WishResponseDto {
    return {
      id: wish.id,
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: Number(wish.price ?? 0),
      raised: Number(wish.raised ?? 0),
      copied: Number(wish.copied ?? 0),
      description: wish.description,
      owner: wish.owner
        ? {
            id: wish.owner.id,
            username: wish.owner.username,
            about: wish.owner.about,
            avatar: wish.owner.avatar,
            email: wish.owner.email,
            createdAt: wish.owner.createdAt,
            updatedAt: wish.owner.updatedAt,
          }
        : null,
      offers: Array.isArray(wish.offers)
        ? wish.offers.map(OfferResponseDto.fromEntity)
        : [],
      createdAt: wish.createdAt,
      updatedAt: wish.updatedAt,
    };
  }
}
