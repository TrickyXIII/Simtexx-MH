import pg from "pg";  // la comunicacion de node.js a postgresql
import "dotenv/config"; //cargar variables desde unENV para no exponerlo

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});
