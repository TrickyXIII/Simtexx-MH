import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState(() => {
    const data = JSON.parse(localStorage.getItem("usuarios")) || [];
    return data;
  });

  useEffect(() => {
    // Solo sincronizar cambios externos del localStorage
    const handleStorageChange = () => {
      const data = JSON.parse(localStorage.getItem("usuarios")) || [];
      setUsuarios(data);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  function eliminarUsuario(id) {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

    const nuevos = usuarios.filter((u) => u.id !== id);
    localStorage.setItem("usuarios", JSON.stringify(nuevos));
    setUsuarios(nuevos);
  }

  return (
    <><NavBar/>
    <div>
      <h2>Gestión de Usuarios</h2>

      <button onClick={() => navigate("/CrearUser")}>
        Crear Usuario
      </button>

      <table
        style={{
          width: "100%",
          marginTop: "20px",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc" }}>Nombre</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Correo</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Rol</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Estado</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                No hay usuarios registrados
              </td>
            </tr>
          )}

          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.nombre}</td>
              <td>{u.correo}</td>
              <td>{u.rol}</td>
              <td>{u.activo}</td>
              <td>
                <button onClick={() => navigate(`/usuarios/${u.id}`)}>
                  Ver / Editar
                </button>

                <button
                  onClick={() => eliminarUsuario(u.id)}
                  style={{ marginLeft: "10px", background: "red", color: "white" }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div><Footer/></>
  );
}
