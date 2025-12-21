import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getOTs, deleteOT } from "../services/otService"; 
import { getUserFromToken } from "../utils/auth";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./ListaOT.css";

const ListaOT = () => {
  const [ots, setOts] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  const usuario = getUserFromToken() || { rol_id: 0 };
  const isAdminOrMantenedor = usuario.rol_id === 1 || usuario.rol_id === 3;

  useEffect(() => {
    cargarOTs();
  }, []);

  const cargarOTs = async () => {
    try {
      const data = await getOTs();
      setOts(data);
    } catch (error) {
      console.error("Error cargando OTs:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta OT?")) {
      await deleteOT(id);
      cargarOTs();
    }
  };

  // Lógica de filtrado
  const otsFiltradas = ots.filter((ot) => {
    const coincideEstado = filtro ? ot.estado === filtro : true;
    const coincideBusqueda = busqueda
      ? ot.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        ot.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (ot.cliente_nombre && ot.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase()))
      : true;
    return coincideEstado && coincideBusqueda;
  });

  return (
    <>
      <NavBar />
      <div className="lista-ot-wrapper">
        
        {/* ENCABEZADO CON MARGIN CORREGIDO */}
        <div className="lista-ot-header">
          <h1 className="lista-ot-titulo">Gestión de OTs</h1>
        </div>

        {/* BARRA DE ACCIONES */}
        <div className="acciones-bar">
          <div className="filtros-group">
            <input
              type="text"
              placeholder="Buscar por código, título o cliente..."
              className="input-busqueda"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <select 
              className="select-filtro" 
              value={filtro} 
              onChange={(e) => setFiltro(e.target.value)}
            >
              <option value="">Todos los Estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </div>

          {isAdminOrMantenedor && (
            <Link to="/crear-ot" className="btn-nuevo">
              + Nueva OT
            </Link>
          )}
        </div>

        {/* TABLA */}
        <div className="tabla-container">
          <table className="tabla-ot">
            <thead>
              <tr>
                <th>Código</th>
                <th>Título</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Responsable</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {otsFiltradas.length > 0 ? (
                otsFiltradas.map((ot) => (
                  <tr key={ot.id_ot}>
                    <td><strong>{ot.codigo}</strong></td>
                    <td>{ot.titulo}</td>
                    <td>{ot.cliente_nombre}</td>
                    <td>
                      <span className={`badge-lista ${ot.estado.toLowerCase().replace(" ", "-")}`}>
                        {ot.estado}
                      </span>
                    </td>
                    <td>{ot.responsable_nombre || "Sin Asignar"}</td>
                    <td className="acciones-cell">
                      <button 
                        className="btn-icon btn-ver" 
                        title="Ver Detalle"
                        onClick={() => navigate(`/detalle/${ot.id_ot}`)}
                      >
                        👁️
                      </button>
                      {isAdminOrMantenedor && (
                        <>
                          <button 
                            className="btn-icon btn-editar" 
                            title="Editar"
                            onClick={() => navigate(`/ModificarOT/${ot.id_ot}`)}
                          >
                            ✏️
                          </button>
                          {usuario.rol_id === 1 && (
                            <button 
                              className="btn-icon btn-eliminar" 
                              title="Eliminar"
                              onClick={() => handleDelete(ot.id_ot)}
                            >
                              🗑️
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "30px" }}>
                    No se encontraron órdenes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
      <Footer />
    </>
  );
};

export default ListaOT;