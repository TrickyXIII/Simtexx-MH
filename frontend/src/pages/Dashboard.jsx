import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./Dashboard.css";
import { getOTs, getDashboardStats } from "../services/otService"; 
import { Link } from "react-router-dom";
import { getUserFromToken } from "../utils/auth"; 

const Dashboard = () => {
  const [ots, setOts] = useState([]);
  const [stats, setStats] = useState({
    total: 0, pendientes: 0, en_proceso: 0, finalizadas: 0
  });

  // Estado para los filtros de fecha
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: ""
  });

  const usuario = getUserFromToken() || { nombre: "Usuario", rol: "Invitado", id: 0, rol_id: 0 };
  const isCliente = usuario.rol_id === 2;

  // Función para cargar datos (se usa al inicio y al filtrar)
  async function cargarDatos() {
    try {
      const estadisticas = await getDashboardStats();
      if(estadisticas) setStats(estadisticas);

      // Pasamos los filtros actuales al servicio
      const listaOts = await getOTs(filtros);
      
      if (Array.isArray(listaOts)) {
        setOts(listaOts.slice(0, 10)); // Mostramos hasta 10 recientes
      }
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    }
  }

  // Cargar al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  // Manejador de cambios en inputs
  const handleFilterChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  return (
    <>
      <NavBar />
      <div className="container">
        
        {/* Encabezado */}
        <div className="header-dashboard">
          <h1 className="title">Panel de Control</h1>
          <div className="subtittle">
            Bienvenido, <b>{usuario.nombre}</b> <span className="rol-badge">{usuario.rol}</span>
          </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="cardContainer">
          <Link to="/crear-ot" className="card">Nueva Solicitud (OT)</Link>
          <Link to="/lista-ot" className="card">Ver Mis Órdenes</Link>
          {!isCliente && <Link to="/GestionUser" className="card">Gestionar Usuarios</Link>}
        </div>

        {/* LAYOUT NUEVO: Grid Tabla (Izquierda) + Resumen (Derecha) */}
        <div className="dashboard-grid">
          
          {/* SECCIÓN IZQUIERDA: TABLA Y FILTROS */}
          <div className="main-section">
            <div className="table-header-row">
              <h2 className="section-title">Últimas Órdenes</h2>
              
              {/* Filtros de Fecha Recuperados */}
              <div className="date-filters">
                <input 
                  type="date" 
                  name="fechaInicio" 
                  value={filtros.fechaInicio} 
                  onChange={handleFilterChange} 
                  title="Fecha Desde"
                />
                <span style={{color:'#666'}}>-</span>
                <input 
                  type="date" 
                  name="fechaFin" 
                  value={filtros.fechaFin} 
                  onChange={handleFilterChange} 
                  title="Fecha Hasta"
                />
                <button onClick={cargarDatos} className="btn-filtrar">🔍</button>
              </div>
            </div>

            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Estado</th>
                    <th>Inicio</th>
                    <th>Fin</th> {/* Columna Recuperada */}
                    <th>Responsable</th> {/* Columna Recuperada */}
                    <th>Ver</th>
                  </tr>
                </thead>
                <tbody>
                  {ots.length === 0 ? (
                    <tr><td colSpan="6" className="no-data">No hay registros recientes</td></tr>
                  ) : (
                    ots.map((ot) => (
                      <tr key={ot.id_ot}>
                        <td className="fw-bold">{ot.codigo}</td>
                        <td>
                          <span className={`status-badge ${ot.estado.toLowerCase().replace(" ", "-")}`}>
                            {ot.estado}
                          </span>
                        </td>
                        <td>{ot.fecha_inicio_contrato?.slice(0, 10) || "-"}</td>
                        <td>{ot.fecha_fin_contrato?.slice(0, 10) || "-"}</td>
                        <td>{ot.responsable_nombre || "Sin Asignar"}</td>
                        <td>
                          <Link to={`/detalle/${ot.id_ot}`} className="btn-icon">👁️</Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECCIÓN DERECHA: RESUMEN (Movido aquí) */}
          <aside className="panel-resumen">
            <h2 className="panel-title">Resumen Global</h2>
            <div className="panel-list">
              <div className="panel-row total">
                <span>Total OTs</span> <strong>{stats.total}</strong>
              </div>
              <div className="panel-row pendiente">
                <span>Pendientes</span> <strong>{stats.pendientes}</strong>
              </div>
              <div className="panel-row proceso">
                <span>En Proceso</span> <strong>{stats.en_proceso}</strong>
              </div>
              <div className="panel-row finalizada">
                <span>Finalizadas</span> <strong>{stats.finalizadas}</strong>
              </div>
            </div>
          </aside>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;