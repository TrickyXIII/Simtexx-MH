export function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    // 1. Decodificar el payload del JWT manualmente para no instalar librerías extra
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const decoded = JSON.parse(jsonPayload);
    
    // 2. Verificar expiración (opcional pero recomendado)
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      localStorage.removeItem("token");
      return null;
    }

    // Retorna { id, rol, rol_id, ... }
    return decoded; 
  } catch (error) {
    console.error("Token inválido", error);
    return null;
  }
}

// Helper rápido
export function isAdminUser() {
  const user = getUserFromToken();
  return user && user.rol_id === 1;
}