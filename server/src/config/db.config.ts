import dotenv from 'dotenv';
dotenv.config();

interface DBConfig {
  HOST: string;
  USER: string;
  PASSWORD: string;
  DB: string;
  dialect: 'mysql';
}

const dbConfig: DBConfig = {
  HOST: 'localhost',
  USER: 'root',
  PASSWORD: process.env.DB_PASSWORD || '',
  DB: 'nccuTT_db',
  dialect: 'mysql',
};

export default dbConfig;

