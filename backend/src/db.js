import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Detectamos si estamos en producción (Render pone NODE_ENV en 'production')
const isProduction = process.env.NODE_ENV === "production";

const connectionConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 5432,
};

// Si estamos en producción, activamos SSL requerido por Render
if (isProduction) {
  connectionConfig.ssl = {
    rejectUnauthorized: false,
  };
}

export const pool = new pg.Pool(connectionConfig);

pool.connect()
  .then(() => console.log(`✅ Conectado a la BD (${isProduction ? 'Nube' : 'Local'})`))
  .catch((err) => console.error("❌ Error de conexión a BD", err));