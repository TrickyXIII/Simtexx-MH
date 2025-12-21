import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { activateUser, desactivarUser } from "../services/usuariosService";
import { getUserFromToken } from "../utils/auth";
import "./GestionUser.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);

  const currentUser = getUserFromToken();
  const isAdmin = currentUser && currentUser.rol_id === 1;
  const isMantenedor = currentUser && currentUser.rol_id === 3;

  useEffect(() => {
    if (!currentUser || (!isAdmin && !isMantenedor)) {
        alert("Acceso denegado.");
        navigate("/dashboard");
        return;
    }
    cargarUsuarios();
  }, [isAdmin, isMantenedor, navigate]);

  const cargarUsuarios = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/api/usuarios`, {
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.usuarios && Array.isArray(data.usuarios)) {
        setUsuarios(data.usuarios);
      }
    } catch (error) { console.error("Error:", error); }
  };

  async function toggleEstadoUsuario(id, estadoActual) {
    if (!isAdmin) return;
    if (estadoActual) {
        if (!confirm("¿Seguro que deseas desactivar este usuario?")) return;
        if (await desactivarUser(id)) { alert("Usuario desactivado"); cargarUsuarios(); }
    } else {
        if (!confirm("¿Deseas REACTIVAR este usuario?")) return;
        if (await activateUser(id)) { alert("Usuario reactivado"); cargarUsuarios(); }
    }
  }

  if (!currentUser) return null;

  return (
    <>
      <NavBar />
      <div className="gestion-user-container">
        
        <div className="gestion-header">
            <button onClick={() => navigate(-1)} className="btn-volver-outline">
                ⬅ Volver
            </button>
            <h2 className="titulo-gestion">Gestión de Usuarios</h2>
            {isAdmin && (
              <button onClick={() => navigate("/CrearUser")} className="btn-crear">
                + Crear Usuario
              </button>
            )}
        </div>

        <div className="tabla-container">
          <table className="tabla-users">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th style={{textAlign: 'center'}}>Estado</th>
                {isAdmin && <th style={{textAlign: 'center'}}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr><td colSpan={isAdmin ? 5 : 4} style={{ textAlign: "center", padding: "20px" }}>No hay usuarios registrados.</td></tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id_usuarios}>
                    <td>{u.nombre}</td>
                    <td>{u.correo}</td>
                    <td>{u.rol_nombre || "Sin Rol"}</td>
                    <td style={{textAlign: 'center'}}>
                      <span className={u.activo ? "badge-activo" : "badge-inactivo"}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: "center" }}>
                          <button onClick={() => navigate(`/ModificarUser/${u.id_usuarios}`)} className="btn-accion-azul">Editar</button>
                          <button onClick={() => toggleEstadoUsuario(u.id_usuarios, u.activo)} className={u.activo ? "btn-accion-rojo" : "btn-accion-verde"}>
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