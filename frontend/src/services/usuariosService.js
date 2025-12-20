// Detecta la URL de la API según el entorno
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = `${BASE_URL}/api/usuarios`;

export async function getClientes() {
  try {
    const res = await fetch(`${API_URL}/clientes`); // NO requiere token (según rutas actuales) o ajusta si lo protegiste
    if (!res.ok) throw new Error("Error cargando clientes");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getMantenedores() {
  const token = localStorage.getItem("token"); // Si protegiste esta ruta en backend, envía token
  try {
    const res = await fetch(`${API_URL}/mantenedores`, {
        headers: { "Authorization": `Bearer ${token}` } 
    });
    if (!res.ok) throw new Error("Error cargando mantenedores");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getUserById(id) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error cargando usuario");
    const data = await res.json();
    return data.usuario;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateUser(id, userData) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(userData),
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al actualizar");
    }
    return await res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createUser(userData) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error al crear el usuario");
    }
    return data;
  } catch (error) {
    console.error("Error en createUser:", error);
    throw error;
  }
}