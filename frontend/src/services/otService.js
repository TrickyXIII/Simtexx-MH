const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = `${BASE_URL}/api/ot`;
const PDF_URL = `${BASE_URL}/api/pdf`; 

// --- AUXILIAR BLOB ---
const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// --- ESTADÍSTICAS ---
export async function getDashboardStats(usuario = {}) {
  const role = usuario.rol_nombre || usuario.rol || "user";
  const userId = usuario.id_usuarios || usuario.id || "";

  try {
    const response = await fetch(`${API_URL}/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "role": role, 
        "userid": userId
      },
    });
    if (!response.ok) throw new Error("Error obteniendo estadísticas");
    return await response.json();
  } catch (error) {
    console.error(error);
    return { total: 0, pendientes: 0, en_proceso: 0, finalizadas: 0 };
  }
}

// --- OBTENER OTs ---
export async function getOTs(filtros = {}, usuario = {}) {
  const params = new URLSearchParams();
  const role = usuario.rol_nombre || usuario.rol || "user";
  const userId = usuario.id_usuarios || usuario.id || "";

  if (filtros.estado && filtros.estado !== "Todos") params.append("estado", filtros.estado);
  if (filtros.busqueda) params.append("busqueda", filtros.busqueda);
  if (filtros.fechaInicio) params.append("fechaInicio", filtros.fechaInicio);
  if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin);

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "role": role, 
        "userid": userId
      },
    });
    if (!response.ok) throw new Error("Error al obtener las OT");
    return await response.json();
  } catch (error) {
    console.error(error);
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
    console.error(error);
    throw error;
  }
}

// --- OBTENER POR ID (SEGURIDAD AÑADIDA) ---
export async function getOTById(id) {
  // Leemos usuario del storage para tener las credenciales
  const userStr = localStorage.getItem("usuarioActual");
  const usuario = userStr ? JSON.parse(userStr) : {};
  const role = usuario.rol_nombre || usuario.rol || "user";
  const userId = usuario.id_usuarios || usuario.id || "";

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "role": role, 
        "userid": userId
      }
    });

    if (response.status === 403) {
      alert("Acceso Denegado: No tienes permiso para ver esta OT.");
      return null;
    }
    if (!response.ok) throw new Error("No se encontró la OT");
    return await response.json();
  } catch (error) {
    console.error("Error desde getOTById:", error);
    return null;
  }
}

// --- ACTUALIZAR OT ---
export async function updateOT(id, data, usuario = {}) {
  if (!usuario.id && !usuario.id_usuarios) {
      const userStr = localStorage.getItem("usuarioActual");
      if (userStr) usuario = JSON.parse(userStr);
  }

  const role = usuario.rol_nombre || usuario.rol || "user";
  const userId = usuario.id_usuarios || usuario.id || "";

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "role": role,
        "userid": userId 
      },
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

// --- EXPORTAR CSV ---
export async function exportCSV(filtros = {}, usuario = {}) {
  const params = new URLSearchParams();
  const role = usuario.rol_nombre || usuario.rol || "user";
  const userId = usuario.id_usuarios || usuario.id || "";

  if (filtros.estado && filtros.estado !== "Todos") params.append("estado", filtros.estado);
  if (filtros.busqueda) params.append("busqueda", filtros.busqueda);
  if (filtros.fechaInicio) params.append("fechaInicio", filtros.fechaInicio);
  if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin);

  try {
    const response = await fetch(`${API_URL}/export/csv?${params.toString()}`, {
        method: 'GET',
        headers: {
            "role": role,
            "userid": userId
        }
    });
    if (!response.ok) throw new Error("Error al exportar CSV");
    const blob = await response.blob();
    downloadBlob(blob, "reporte_ots.csv");
  } catch (error) {
    console.error(error);
    alert("No se pudo descargar el reporte.");
  }
}

// --- EXPORTAR PDF ---
export async function exportPDFById(id, codigo, usuario = {}) {
  const role = usuario.rol_nombre || usuario.rol || "user";
  const userId = usuario.id_usuarios || usuario.id || "";

  try {
    const response = await fetch(`${PDF_URL}/ot/${id}/export`, {
        method: 'GET',
        headers: {
            "role": role,
            "userid": userId
        }
    });
    if (!response.ok) throw new Error("Error al exportar PDF");
    const blob = await response.blob();
    downloadBlob(blob, `OT-${codigo}.pdf`);
  } catch (error) {
    console.error(error);
    alert("Error al descargar PDF.");
  }
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
    if (!response.ok) throw new Error("Error en la subida");
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// --- COMENTARIOS ---
export async function getComentarios(otId) {
  try {
    const res = await fetch(`${BASE_URL}/api/comentarios/${otId}`);
    if (!res.ok) throw new Error("Error cargando comentarios");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function crearComentario(otId, usuarioId, texto) {
  try {
    const res = await fetch(`${BASE_URL}/api/comentarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ot_id: otId, usuarios_id: usuarioId, texto }),
    });
    if (!res.ok) throw new Error("Error guardando comentario");
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

// NUEVA FUNCIÓN DE EDICIÓN
export async function updateComentario(comentarioId, usuarioId, texto) {
  try {
    const res = await fetch(`${BASE_URL}/api/comentarios/${comentarioId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarios_id: usuarioId, texto }),
    });
    if (!res.ok) throw new Error("Error editando comentario");
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

// --- HISTORIAL ---
export async function getHistorial(otId) {
  try {
    const res = await fetch(`${BASE_URL}/api/auditorias/${otId}`);
    if (!res.ok) throw new Error("Error cargando historial");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}