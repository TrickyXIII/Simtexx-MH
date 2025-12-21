import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { activateUser, desactivarUser } from "../services/usuariosService";
import { getUserFromToken } from "../utils/auth";
import "./GestionUser.css";
import "./DetalleOT.css"; // IMPORTANTE: Reutilizamos el estilo del botón volver

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true); 

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
    setLoading(true);
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
    finally { setLoading(false); }
  };

  async function toggleEstadoUsuario(id, estadoActual) {
    if (!isAdmin) return;
    const accion = estadoActual ? "desactivar" : "activar";
    if (!confirm(`¿Seguro que deseas ${accion} este usuario?`)) return;

    if (estadoActual) {
        if (await desactivarUser(id)) { alert("Usuario desactivado"); cargarUsuarios(); }
    } else {
        if (await activateUser(id)) { alert("Usuario reactivado"); cargarUsuarios(); }
    }
  }

  if (!currentUser) return null;

  return (
    <>
      <NavBar />
      <div className="gestion-user-container">
        
        <div className="gestion-header" style={{position: 'relative', display:'flex', justifyContent: 'center', alignItems:'center', minHeight:'60px'}}>
            <button onClick={() => navigate(-1)} className="btn-volver-std" style={{position: 'absolute', left: 0}}>
              ⬅ Volver
            </button>
            
            <h2 className="titulo-gestion">Gestión de Usuarios</h2>
            
            <div style={{position: 'absolute', right: 0}}>
                {isAdmin && (
                <button onClick={() => navigate("/CrearUser")} className="btn-crear">
                    + Nuevo Usuario
                </button>
                )}
            </div>
        </div>

        <div className="tabla-container">
          <table className="tabla-users">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th style={{textAlign: 'center'}}>Estado</th>
                {isAdmin && <th style={{textAlign: 'center', width: '180px'}}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan={isAdmin ? 5 : 4} style={{ textAlign: "center", padding: "30px" }}>Cargando usuarios...</td></tr>
              ) : usuarios.length === 0 ? (
                <tr><td colSpan={isAdmin ? 5 : 4} style={{ textAlign: "center", padding: "30px" }}>No hay usuarios registrados.</td></tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id_usuarios}>
                    <td style={{fontWeight:'600'}}>{u.nombre}</td>
                    <td>{u.correo}</td>
                    <td>{u.rol_nombre || "Sin Rol"}</td>
                    <td style={{textAlign: 'center'}}>
                      <span className={u.activo ? "badge-activo" : "badge-inactivo"}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: "center" }}>
                          <div className="acciones-cell">
                              <button onClick={() => navigate(`/ModificarUser/${u.id_usuarios}`)} className="btn-accion-azul" title="Editar Usuario">
                                Editar
                              </button>
                              <button onClick={() => toggleEstadoUsuario(u.id_usuarios, u.activo)} className={u.activo ? "btn-accion-rojo" : "btn-accion-verde"} title={u.activo ? "Desactivar Usuario" : "Activar Usuario"}>
                                {u.activo ? "Desactivar" : "Activar"}
                              </button>
                          </div>
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