// services/otService.js

// 🛑 URL DE PRODUCCIÓN INFERIDA: DEBES CONFIRMARLA CON TU EQUIPO.
// El dominio se infiere de la URL de la base de datos que nos proporcionaste.
const BASE_URL = "https://dpg-d4iu1cngi27c739snkjg-a.onrender.com"; 
const OT_URL = `${BASE_URL}/api/ot`; // Endpoint para órdenes de trabajo

// Función para CREAR una Orden de Trabajo (Llama a la API con POST)
export async function createOT(ot) {
  try {
    const response = await fetch(OT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ot), 
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: Fallo al crear la OT en el servidor.`);
    }

    return await response.json(); 

  } catch (error) {
    console.error("Fallo la llamada a la API para crear OT:", error);
    throw error;
  }
}

// Función para OBTENER TODAS las Órdenes de Trabajo (Llama a la API con GET)
export async function getOTs() {
  try {
    const response = await fetch(OT_URL);
    if (!response.ok) {
        throw new Error(`Error ${response.status}: Fallo al obtener las OTs del servidor.`);
    }
    return await response.json(); 
  } catch (error) {
    console.error("Fallo la llamada a la API para obtener OTs:", error);
    return []; 
  }
}

// Funciones restantes con advertencia
export function getOTById() { console.warn("getOTById no implementada para API"); return null; }
export function updateOT() { console.warn("updateOT no implementada para API"); }
export function saveOTs() { console.warn("saveOTs no implementada para API"); }
export function deleteOT() { console.warn("deleteOT no implementada para API"); }