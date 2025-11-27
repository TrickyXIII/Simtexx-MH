// frontend/src/services/otService.js

// URL de backend (Puerto 4000 según el README)
const API_URL = "http://localhost:4000/api/ot";

// --- NUEVA FUNCIÓN PARA CREAR EN POSTGRESQL ---
export async function createOT(otData) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(otData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al crear la OT");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en createOT:", error);
    throw error;
  }
}

// --- FUNCIONES ANTIGUAS (Mantén por ahora para no romper la lista mientras se migra el resto) ---
const KEY = "ot_list";

export function getOTs() {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

export function getOTById(id) {
  return getOTs().find((ot) => ot.id === id);
}


const API_URL = "http://localhost:4000/api/ot";
export async function deleteOTBackend(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error al eliminar la OT en el servidor");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error eliminando OT en backend:", error);
    
  }
}


