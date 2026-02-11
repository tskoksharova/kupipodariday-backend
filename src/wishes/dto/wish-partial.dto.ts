import { Wish } from '../entities/wish.entity';

export class WishPartialDto {
  id: number;
  name: string;
  link: string;
  image: string;
  price: number;
  raised: number;
  copied: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(wish: Wish): WishPartialDto {
    return {
      id: wish.id,
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: Number(wish.price ?? 0),
      raised: Number(wish.raised ?? 0),
      copied: Number(wish.copied ?? 0),
      description: wish.description,
      createdAt: wish.createdAt,
      updatedAt: wish.updatedAt,
    };
  }
}
