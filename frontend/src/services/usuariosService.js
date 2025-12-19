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