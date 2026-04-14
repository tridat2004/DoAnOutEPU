import { DataSource } from 'typeorm';
import { createDatabaseOptions } from './database.config';

const dataSource = new DataSource(createDatabaseOptions());

export default dataSource;
