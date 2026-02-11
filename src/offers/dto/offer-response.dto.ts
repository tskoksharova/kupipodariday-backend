import { Offer } from '../entities/offer.entity';

export class OfferResponseDto {
  id: number;
  amount: number;
  hidden: boolean;
  user: any;
  item: any;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(offer: Offer): OfferResponseDto {
    return {
      id: offer.id,
      amount: Number(offer.amount ?? 0),
      hidden: Boolean(offer.hidden),
      user: offer.user
        ? {
            id: offer.user.id,
            username: offer.user.username,
            about: offer.user.about,
            avatar: offer.user.avatar,
            email: offer.user.email,
            createdAt: offer.user.createdAt,
            updatedAt: offer.user.updatedAt,
          }
        : null,
      item: offer.item
        ? {
            id: offer.item.id,
            name: offer.item.name,
            link: offer.item.link,
            image: offer.item.image,
            price: Number((offer.item as any).price ?? 0),
            raised: Number((offer.item as any).raised ?? 0),
            copied: Number((offer.item as any).copied ?? 0),
            description: offer.item.description,
            createdAt: offer.item.createdAt,
            updatedAt: offer.item.updatedAt,
          }
        : null,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
    };
  }
}
