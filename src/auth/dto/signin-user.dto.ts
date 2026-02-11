import { IsString, Length } from 'class-validator';

export class SigninUserDto {
  @IsString()
  username: string;

  @IsString()
  @Length(6, 200)
  password: string;
}
