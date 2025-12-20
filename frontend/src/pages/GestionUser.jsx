import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { activateUser, desactivarUser } from "../services/usuariosService";

// Definimos la URL correcta (Local o Nube)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);

  // Obtenemos rol
  const userString = localStorage.getItem("usuarioActual");
  const currentUser = userString ? JSON.parse(userString) : { rol_id: 0 };
  const isAdmin = currentUser.rol_id === 1;
  const isCliente = currentUser.rol_id === 2;

  useEffect(() => {
    // Protección: Si es cliente, lo sacamos
    if (isCliente) {
        navigate("/dashboard");
        return;
    }
    cargarUsuarios();
  }, [isCliente, navigate]);

  const cargarUsuarios = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/api/usuarios`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        }
      });
      const data = await res.json();
      
      if (data.usuarios && Array.isArray(data.usuarios)) {
        setUsuarios(data.usuarios);
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  async function toggleEstadoUsuario(id, estadoActual) {
    if (!isAdmin) return; // Doble check

    if (estadoActual) {
        if (!confirm("¿Seguro que deseas desactivar este usuario?")) return;
        const success = await desactivarUser(id);
        if (success) {
            alert("Usuario desactivado");
            cargarUsuarios();
        }
    } else {
        if (!confirm("¿Deseas REACTIVAR este usuario?")) return;
        const success = await activateUser(id);
        if (success) {
            alert("Usuario reactivado exitosamente");
            cargarUsuarios();
        }
    }
  }

  return (
    <>
      <NavBar />
      <div style={{ maxWidth: "1000px", margin: "80px auto", padding: "20px", minHeight: "calc(100vh - 160px)" }}>
        
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            position: 'relative', 
            marginBottom: '30px' 
        }}>
            <button 
                onClick={() => navigate(-1)}
                style={{
                    position: 'absolute',
                    left: 0,
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '2px solid #333',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: '#333'
                }}
            >
                ⬅ Volver
            </button>
            <h2 style={{ margin: 0 }}>Gestión de Usuarios</h2>
        </div>

        {/* Botón Crear: Solo Admin */}
        {isAdmin && (
          <button 
            onClick={() => navigate("/CrearUser")}
            style={{
              padding: "10px 20px",
              background: "#333",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
              marginBottom: "20px"
            }}
          >
            + Crear Usuario
          </button>
        )}

        <div style={{ overflowX: "auto", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", borderRadius: "8px", background: "white" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f4f4f4" }}>
              <tr>
                <th style={{ padding: "12px", borderBottom: "2px solid #ddd", textAlign: "left" }}>Nombre</th>
                <th style={{ padding: "12px", borderBottom: "2px solid #ddd", textAlign: "left" }}>Correo</th>
                <th style={{ padding: "12px", borderBottom: "2px solid #ddd", textAlign: "left" }}>Rol</th>
                <th style={{ padding: "12px", borderBottom: "2px solid #ddd", textAlign: "center" }}>Estado</th>
                {/* Columna Acciones solo visible para Admin */}
                {isAdmin && <th style={{ padding: "12px", borderBottom: "2px solid #ddd", textAlign: "center" }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                    Cargando o no hay usuarios registrados...
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id_usuarios} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px" }}>{u.nombre}</td>
                    <td style={{ padding: "12px" }}>{u.correo}</td>
                    <td style={{ padding: "12px" }}>{u.rol_nombre || "Sin Rol"}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "15px",
                        background: u.activo ? "#d4edda" : "#f8d7da",
                        color: u.activo ? "#155724" : "#721c24",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    
                    {/* Acciones solo para Admin */}
                    {isAdmin && (
                      <td style={{ padding: "12px", textAlign: "center", display: "flex", justifyContent: "center", gap: "10px" }}>
                        <button
                          onClick={() => navigate(`/ModificarUser/${u.id_usuarios}`)}
                          style={{
                            padding: "6px 12px",
                            background: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "13px"
                          }}
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => toggleEstadoUsuario(u.id_usuarios, u.activo)}
                          style={{
                            padding: "6px 12px",
                            background: u.activo ? "#c62828" : "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "13px",
                            width: "90px"
                          }}
                        >
                          {u.activo ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  );
}