import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

// Detectamos si la URL incluye "localhost" o "127.0.0.1"
const isLocal = process.env.DATA_BASEURL?.includes("localhost") || process.env.DATA_BASEURL?.includes("127.0.0.1");

// Configuración dinámica:
// - Si es local: ssl = false
// - Si es nube: ssl = { rejectUnauthorized: false }
const config = {
  connectionString: process.env.DATA_BASEURL,
  ssl: isLocal ? false : { rejectUnauthorized: false }
};

export const pool = new Pool(config);