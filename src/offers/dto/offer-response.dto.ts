import { Offer } from '../entities/offer.entity';

type OfferUserResponse = {
  id: number;
  username: string;
  about: string | null;
  avatar: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

type OfferItemResponse = {
  id: number;
  name: string;
  link: string;
  image: string;
  price: number;
  raised: number;
  copied: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number')
    return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function getNumberField(obj: unknown, key: string): number {
  if (obj && typeof obj === 'object') {
    const v = (obj as Record<string, unknown>)[key];
    return toNumber(v, 0);
  }
  return 0;
}

export class OfferResponseDto {
  id: number;
  amount: number;
  hidden: boolean;
  user: OfferUserResponse | null;
  item: OfferItemResponse | null;
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
            about: offer.user.about ?? null,
            avatar: offer.user.avatar ?? null,
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
            price: getNumberField(offer.item, 'price'),
            raised: getNumberField(offer.item, 'raised'),
            copied: getNumberField(offer.item, 'copied'),
            description: offer.item.description ?? null,
            createdAt: offer.item.createdAt,
            updatedAt: offer.item.updatedAt,
          }
        : null,

      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
    };
  }
}
