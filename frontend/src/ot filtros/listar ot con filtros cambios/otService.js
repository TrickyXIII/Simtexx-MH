// frontend/src/services/otService.js

// URL del Backend (Puerto 4000)
const API_URL = "http://localhost:4000/api/ots";
const KEY = "ot_list";

// --- 1. FUNCIONES CONECTADAS AL BACKEND (Nuevas) ---

// Obtener OTs (GET)
export async function getOTs(filtros = {}, usuario = {}) {
  const params = new URLSearchParams();

  if (filtros.estado) params.append("estado", filtros.estado);
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
      }
    });
    
    if (!response.ok) return [];
    const result = await response.json();
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Error API GET:", error);
    return [];
  }
}

// Crear OT (POST)
export async function createOT(nuevaOT) {
  try {
    const datosParaEnviar = {
      titulo: nuevaOT.titulo || nuevaOT.nombre || "Sin Título",
      descripcion: nuevaOT.descripcion || "Sin descripción",
      estado: "Pendiente",
      fecha_inicio_contrato: nuevaOT.fechaInicio || new Date().toISOString().split('T')[0],
      fecha_fin_contrato: nuevaOT.fechaFin || new Date().toISOString().split('T')[0],
      responsable_id: parseInt(nuevaOT.responsable) || parseInt(nuevaOT.responsableId) || null
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosParaEnviar)
    });

    if (response.ok) {
        return await response.json();
    } else {
        console.error("Error al guardar en BD:", await response.text());
        return null;
    }
  } catch (error) {
    console.error("Error API POST:", error);
    return null;
  }
}

// --- 2. FUNCIONES LEGACY (LocalStorage) ---
// Estas son necesarias para que 'ModificarOT' y 'DetalleOT' no rompan la app

export function getOTById(id) {
  // Primero intentamos buscar en localStorage (Legacy)
  const data = localStorage.getItem(KEY);
  let ot = data ? JSON.parse(data).find(ot => ot.id == id) : null;
  
  // Si no está, devolvemos null (aquí podrías implementar fetch by ID en el futuro)
  return ot;
}

// ¡ESTA ES LA QUE FALTABA Y ROMPÍA TODO!
export function updateOT(id, data) {
  const list = JSON.parse(localStorage.getItem(KEY) || "[]");
  const index = list.findIndex(o => o.id == id);
  if (index !== -1) {
    list[index] = { ...list[index], ...data };
    localStorage.setItem(KEY, JSON.stringify(list));
  }
}

export function saveOTs(ots) {
  localStorage.setItem(KEY, JSON.stringify(ots));
}

export function deleteOT(id) {
  const list = JSON.parse(localStorage.getItem(KEY) || "[]");
  const nuevos = list.filter(ot => ot.id !== id);
  localStorage.setItem(KEY, JSON.stringify(nuevos));
}