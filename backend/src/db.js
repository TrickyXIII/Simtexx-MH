import pg from "pg";  // la comunicacion de node.js a postgresql
import "dotenv/config"; //cargar variables desde unENV para no exponerlo

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATA_BASEURL,
  ssl: {
    rejectUnauthorized: false // Se puede necesitar para conexiones en Render
  }
});
