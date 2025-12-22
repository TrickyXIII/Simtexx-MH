// Detecta la URL de la API según el entorno
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = `${BASE_URL}/api/usuarios`;

// --- Registro Público ---
export async function registerPublic(userData) {
  try {
    const res = await fetch(`${API_URL}/registro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Error al registrarse");
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// --- Selectores ---
export async function getClientes() {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_URL}/clientes`, {
        headers: { "Authorization": `Bearer ${token}` } 
    });
    if (!res.ok) throw new Error("Error cargando clientes");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getMantenedores() {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_URL}/mantenedores`, {
        headers: { "Authorization": `Bearer ${token}` } 
    });
    if (!res.ok) throw new Error("Error cargando mantenedores");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// --- CRUD Usuarios ---
export async function getUserById(id) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error cargando usuario");
    const data = await res.json();
    return data.usuario;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateUser(id, userData) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(userData),
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al actualizar");
    }
    return await res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createUser(userData) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error al crear el usuario");
    }
    return data;
  } catch (error) {
    console.error("Error en createUser:", error);
    throw error;
  }
}

export async function updateProfile(data) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_URL}/perfil`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Error al actualizar perfil");
    
    return json;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function activateUser(id) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_URL}/${id}/activar`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error al activar usuario");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function desactivarUser(id) {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_URL}/${id}/desactivar`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error al desactivar");
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

export async function login(credentials) {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Error al iniciar sesión");
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}