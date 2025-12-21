import { Navigate } from "react-router-dom";
import { getUserFromToken } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const user = getUserFromToken();

  // Si el token no existe o expiró, redirigir al Login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;