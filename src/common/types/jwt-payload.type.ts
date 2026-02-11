export type JwtPayload = {
  sub: number;
  username: string;
  iat?: number;
  exp?: number;
};
