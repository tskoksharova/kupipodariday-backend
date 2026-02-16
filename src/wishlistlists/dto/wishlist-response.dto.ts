import { Wishlist } from '../entities/wishlist.entity';
import { Wish } from '../../wishes/entities/wish.entity';
import { User } from '../../users/entities/user.entity';

type UserPublic = Pick<
  User,
  'id' | 'username' | 'about' | 'avatar' | 'createdAt' | 'updatedAt'
>;

type WishPartial = Pick<
  Wish,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'name'
  | 'link'
  | 'image'
  | 'price'
  | 'raised'
  | 'copied'
  | 'description'
>;

export class WishlistResponseDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;

  name: string;
  description: string;
  image: string;

  owner: UserPublic;
  items: WishPartial[];

  static fromEntity(entity: Wishlist): WishlistResponseDto {
    if (!entity.owner) {
      throw new Error('Wishlist owner relation is not loaded');
    }

    return {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      name: entity.name,
      description: entity.description ?? '',
      image: entity.image ?? '',
      owner: {
        id: entity.owner.id,
        username: entity.owner.username,
        about: entity.owner.about,
        avatar: entity.owner.avatar,
        createdAt: entity.owner.createdAt,
        updatedAt: entity.owner.updatedAt,
      },
      items: (entity.items ?? []).map((w) => ({
        id: w.id,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
        name: w.name,
        link: w.link,
        image: w.image,
        price: w.price,
        raised: w.raised,
        copied: w.copied,
        description: w.description,
      })),
    };
  }
}
