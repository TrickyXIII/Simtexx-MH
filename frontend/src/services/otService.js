// frontend/src/services/otService.js

// URL de backend (Puerto 4000 según el README)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = `${BASE_URL}/api/ot`; // En tu app.js definiste /api/ot

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
export async function getOTs() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Error al obtener las OT");
    }
    return await response.json();
  } catch (error) {
    console.error("Error desde getOTs:", error);
    return [];
  }
}
// exportacion por ID DE OT
export async function getOTById(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error("No se encontró la OT");
    }
    return await response.json();
  } catch (error) {
    console.error("Error desde getOTById:", error);
    return null;
  }
}


//FUNCION PARA DELETE
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

//EXPORTACION DE CSV PRA LISTA COMPLETA DE OT //
export async function exportCSV() {
  const res = await fetch("http://localhost:4000/api/ot/export/csv");

  if (!res.ok) throw new Error("No se pudo generar CSV");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "ordenes_trabajo.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
//EXPORTACION DE PDF DE TODAS LAS OT 
export async function exportPDF() {
  const res = await fetch("http://localhost:4000/api/ot/export/pdf");

  if (!res.ok) throw new Error("No se pudo generar el PDF");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "ordenes_trabajo.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// UPDATE OT PARA EL MODIFICAR.JSX
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

