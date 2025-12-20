// frontend/src/services/usuariosService.js

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = `${BASE_URL}/api/usuarios`;

// Obtener lista de clientes (Rol 2)
export async function getClientes() {
  try {
    const res = await fetch(`${API_URL}/clientes`);
    if (!res.ok) throw new Error("Error cargando clientes");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Obtener lista de mantenedores (Rol 3)
export async function getMantenedores() {
  try {
    const res = await fetch(`${API_URL}/mantenedores`);
    if (!res.ok) throw new Error("Error cargando mantenedores");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Obtener usuario por ID
export async function getUserById(id) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error cargando usuario");
    const data = await res.json();
    return data.usuario; // El backend devuelve { usuario: ... }
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Actualizar usuario
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

// Crear nuevo usuario (con Token)
export async function createUser(userData) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // <--- IMPORTANTE: Enviamos el token
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