export function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null; // Token mal formado

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const decoded = JSON.parse(jsonPayload);
    
    // Verificar expiración
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      localStorage.removeItem("token");
      return null;
    }

    return decoded; 
  } catch (error) {
    console.error("Error decodificando token:", error);
    localStorage.removeItem("token"); // Limpiar token corrupto
    return null;
  }
}

export function isAdminUser() {
  const user = getUserFromToken();
  return user && user.rol_id === 1;
}