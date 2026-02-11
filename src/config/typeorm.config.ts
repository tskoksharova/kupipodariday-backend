import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeormConfig = (): TypeOrmModuleOptions => {
  console.log('DB CONNECT TO =>', {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    db: process.env.POSTGRES_DB,
  });

  return {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    username: process.env.POSTGRES_USER || 'student',
    password: process.env.POSTGRES_PASSWORD || '03101985',
    database: process.env.POSTGRES_DB || 'kupipodariday',
    synchronize: false,
    autoLoadEntities: true,
    logging: false,
  };
};