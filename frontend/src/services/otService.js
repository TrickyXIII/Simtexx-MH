// Detecta la URL de la API según el entorno (Local o Nube)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = `${BASE_URL}/api/ot`;
const PDF_URL = `${BASE_URL}/api/pdf`; 

// --- HELPER: HEADERS CON TOKEN ---
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}` // <--- La clave para que funcione
  };
};

// --- HELPER: HEADERS PARA ARCHIVOS (PDF/CSV) ---
const getAuthHeadersBlob = () => {
  const token = localStorage.getItem("token");
  return {
    "Authorization": `Bearer ${token}`
  };
};

// --- HELPER: DESCARGA DE BLOBS ---
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

// --- MANEJO DE ERRORES ---
const handleResponse = async (response) => {
  if (response.status === 401 || response.status === 403) {
    alert("Sesión expirada o inválida. Por favor inicie sesión nuevamente.");
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioActual");
    window.location.href = "/";
    throw new Error("Sesión expirada");
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Error en la petición");
  }
  return response;
};

// --- ESTADÍSTICAS ---
export async function getDashboardStats() {
  try {
    const response = await fetch(`${API_URL}/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    await handleResponse(response);
    return await response.json();
  } catch (error) {
    console.error(error);
    return { total: 0, pendientes: 0, en_proceso: 0, finalizadas: 0 };
  }
}

// --- OBTENER OTs ---
export async function getOTs(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.estado && filtros.estado !== "Todos") params.append("estado", filtros.estado);
  if (filtros.busqueda) params.append("busqueda", filtros.busqueda);
  if (filtros.fechaInicio) params.append("fechaInicio", filtros.fechaInicio);
  if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin);

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    await handleResponse(response);
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
      headers: getAuthHeaders(),
      body: JSON.stringify(otData),
    });
    await handleResponse(response);
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// --- OBTENER POR ID ---
export async function getOTById(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders()
    });

    if (response.status === 403) {
      alert("Acceso Denegado: No tienes permiso para ver esta OT.");
      return null;
    }
    await handleResponse(response);
    return await response.json();
  } catch (error) {
    console.error("Error desde getOTById:", error);
    return null;
  }
}

// --- ACTUALIZAR OT ---
export async function updateOT(id, data) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    await handleResponse(response);
    return await response.json();
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
      headers: getAuthHeaders()
    });
    await handleResponse(response);
    return await response.json();
  } catch (error) {
    console.error("Error eliminando OT en backend:", error);
    throw error;
  }
}

// --- EXPORTAR CSV ---
export async function exportCSV(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.estado && filtros.estado !== "Todos") params.append("estado", filtros.estado);
  if (filtros.busqueda) params.append("busqueda", filtros.busqueda);
  if (filtros.fechaInicio) params.append("fechaInicio", filtros.fechaInicio);
  if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin);

  try {
    const response = await fetch(`${API_URL}/export/csv?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeadersBlob()
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
export async function exportPDFById(id, codigo) {
  try {
    const response = await fetch(`${PDF_URL}/ot/${id}/export`, {
        method: 'GET',
        headers: getAuthHeadersBlob()
    });
    if (!response.ok) throw new Error("Error al exportar PDF");
    const blob = await response.blob();
    downloadBlob(blob, `OT-${codigo}.pdf`);
  } catch (error) {
    console.error(error);
    alert("Error al descargar PDF.");
  }
}

// --- IMPORTAR CSV ---
export async function importCSV(file) {
  const formData = new FormData();
  formData.append("file", file);
  const token = localStorage.getItem("token");
  
  try {
    const response = await fetch(`${API_URL}/import/csv`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData,
    });
    
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Error en la subida");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// --- SECCIÓN COMENTARIOS (Corregida) ---
export async function getComentarios(otId) {
  try {
    // AHORA SÍ: headers con token
    const res = await fetch(`${BASE_URL}/api/comentarios/${otId}`, {
        headers: getAuthHeaders() 
    });
    if (!res.ok) throw new Error("Error cargando comentarios");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function crearComentario(otId, usuarioId, texto) {
  try {
    // AHORA SÍ: headers con token (getAuthHeaders incluye content-type y auth)
    const res = await fetch(`${BASE_URL}/api/comentarios`, {
      method: "POST",
      headers: getAuthHeaders(), 
      body: JSON.stringify({ ot_id: otId, usuarios_id: usuarioId, texto }),
    });
    if (!res.ok) throw new Error("Error guardando comentario");
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateComentario(comentarioId, usuarioId, texto) {
  try {
    // AHORA SÍ: headers con token
    const res = await fetch(`${BASE_URL}/api/comentarios/${comentarioId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
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
    // AHORA SÍ: headers con token
    const res = await fetch(`${BASE_URL}/api/auditorias/${otId}`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Error cargando historial");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}