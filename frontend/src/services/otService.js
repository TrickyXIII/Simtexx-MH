// frontend/src/services/otService.js

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = `${BASE_URL}/api/ot`;

// --- 1. OBTENER OTs CON FILTROS ---
export async function getOTs(filtros = {}, usuario = {}) {
  const params = new URLSearchParams();

  if (filtros.estado && filtros.estado !== "Todos") params.append("estado", filtros.estado);
  if (filtros.busqueda) params.append("busqueda", filtros.busqueda);
  if (filtros.fechaInicio) params.append("fechaInicio", filtros.fechaInicio);
  if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin);

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "role": usuario.rol || "user", 
        "userid": usuario.id || ""
      },
    });

    if (!response.ok) throw new Error("Error al obtener las OT");
    return await response.json();
  } catch (error) {
    console.error("Error desde getOTs:", error);
    return [];
  }
}

// --- 2. CREAR OT ---
export async function createOT(otData) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

// --- 3. OBTENER POR ID ---
export async function getOTById(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error("No se encontró la OT");
    return await response.json();
  } catch (error) {
    console.error("Error desde getOTById:", error);
    return null;
  }
}

// --- 4. ACTUALIZAR OT ---
export async function updateOT(id, data) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar la OT");
    return await res.json();
  } catch (err) {
    console.error("Error en updateOT:", err);
    throw err;
  }
}

// --- 5. ELIMINAR OT ---
export async function deleteOTBackend(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error al eliminar la OT en el servidor");
    return await response.json();
  } catch (error) {
    console.error("Error eliminando OT en backend:", error);
  }
}

// --- 6. EXPORTACIONES ---
export async function exportCSV() {
  window.open(`${API_URL}/export/csv`, "_blank");
}

export async function exportPDF() {
  // Asegúrate que tu ruta de PDF en app.js coincida, aquí asumo la estándar
  window.open(`${BASE_URL}/api/pdf/ot/export`, "_blank"); 
}

// --- 7. IMPORTAR CSV ---
export async function importCSV(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_URL}/import/csv`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Error en la subida del archivo");
    return await response.json();
  } catch (error) {
    console.error("Error importando CSV:", error);
    throw error;
  }
}