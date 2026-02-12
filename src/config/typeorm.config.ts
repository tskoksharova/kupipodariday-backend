import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeormConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'student',
  password: process.env.POSTGRES_PASSWORD || '03101985',
  database: process.env.POSTGRES_DB || 'kupipodariday',
  synchronize: false,
  autoLoadEntities: true,
  logging: false,
});
