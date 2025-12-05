// frontend/src/services/otService.js
const API_URL = "http://localhost:4000/api/ots";

// 1. Obtener lista (Ya lo tenías)
export async function getOTs(filtros = {}, usuario = {}) {
  const params = new URLSearchParams();
  if (filtros.estado) params.append("estado", filtros.estado);
  // ... resto de filtros ...
  
  try {
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      headers: { "role": usuario.rol || "user", "userid": usuario.id || "" }
    });
    return response.ok ? await response.json() : [];
  } catch (error) {
    return [];
  }
}

// 2. Crear OT (Ya lo tenías)
export async function createOT(nuevaOT) {
  try {
    const datos = {
        // ... tu mapeo de datos ...
        titulo: nuevaOT.titulo || nuevaOT.nombre,
        descripcion: nuevaOT.descripcion,
        estado: "Pendiente",
        fecha_inicio_contrato: nuevaOT.fechaInicio,
        fecha_fin_contrato: nuevaOT.fechaFin,
        responsable_id: parseInt(nuevaOT.responsable)
    };
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
    return response.ok ? await response.json() : null;
  } catch (e) { return null; }
}

// 3. ¡ACTUALIZADO! OBTENER POR ID DESDE BACKEND
// Antes leía localStorage, ahora usa FETCH
export async function getOTById(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error al buscar OT:", error);
    return null;
  }
}

// Funciones viejas (puedes dejarlas vacías o borrarlas si no se usan)
export function updateOT(id, data) { console.log("Update pendiente de implementar en backend"); }
export function deleteOT(id) { console.log("Delete pendiente"); }