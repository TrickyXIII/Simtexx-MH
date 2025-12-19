const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = `${BASE_URL}/api/ot`;

// --- NUEVO: OBTENER ESTADÍSTICAS ---
export async function getDashboardStats(usuario = {}) {
  try {
    const response = await fetch(`${API_URL}/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "role": usuario.rol || "user", 
        "userid": usuario.id || ""
      },
    });

    if (!response.ok) throw new Error("Error obteniendo estadísticas");
    return await response.json();
  } catch (error) {
    console.error("Error en getDashboardStats:", error);
    return { total: 0, pendientes: 0, en_proceso: 0, finalizadas: 0 };
  }
}

// --- OBTENER OTs ---
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

// --- CREAR OT ---
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

// --- OBTENER POR ID ---
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

// --- ACTUALIZAR OT ---
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

// --- ELIMINAR OT ---
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

// --- EXPORTAR ---
export async function exportCSV() {
  window.open(`${API_URL}/export/csv`, "_blank");
}

export async function exportPDF() {
  window.open(`${BASE_URL}/api/pdf/ot/export`, "_blank"); 
}

// --- IMPORTAR ---
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