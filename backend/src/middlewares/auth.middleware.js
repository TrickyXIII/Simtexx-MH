// backend/src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Espera formato "Bearer <token>"

    if (!token) {
      return res.status(401).json({ error: "Acceso denegado. No hay token." });
    }

    // Verifica el token usando una clave secreta (idealmente en .env)
    const verified = jwt.verify(token, process.env.JWT_SECRET || "secreto_super_seguro");
    
    // Guardamos los datos del usuario en la request para usarlos en los controladores
    req.user = verified; 
    next();
  } catch (error) {
    res.status(403).json({ error: "Token inválido o expirado." });
  }
};