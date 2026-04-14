import 'dotenv/config';
import { DataSourceOptions } from 'typeorm';
import { databaseEntities } from './entities';
import process from 'process';

function getDatabaseUsername(): string {
  const username = process.env.DB_USER ?? process.env.DB_USERNAME;

  if (!username) {
    throw new Error('Missing DB_USER or DB_USERNAME in environment.');
  }

  return username;
}

function getDatabaseName(): string {
  const database = process.env.DB_NAME;

  if (!database) {
    throw new Error('Missing DB_NAME in environment.');
  }

  return database;
}

export function createDatabaseOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: getDatabaseUsername(),
    password: process.env.DB_PASSWORD ?? '',
    database: getDatabaseName(),
    entities: [...databaseEntities],
    migrations: [`${__dirname}/migrations/*{.ts,.js}`],
    synchronize: false,
  };
}
