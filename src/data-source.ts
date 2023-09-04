import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export const typeOrmModuleOptions: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.NODE_ENV === 'dev' ? '' : '',
  port: 3306,
  username: '',
  password: '',
  database: 'contents_management',
  poolSize: 10,
  autoLoadEntities: true,
  synchronize: false,
};

export default new DataSource({
  ...typeOrmModuleOptions,
  type: typeOrmModuleOptions.type as 'mysql',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
