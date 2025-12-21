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

  const usuario = getUserFromToken() || { nombre: "Invitado", rol: "Invitado", id: 0, rol_id: 0 };
  const isCliente = usuario.rol_id === 2;

  useEffect(() => {
    async function cargarDatos() {
      const estadisticas = await getDashboardStats();
      if(estadisticas) setStats(estadisticas);

      const listaOts = await getOTs({});
      if (Array.isArray(listaOts)) {
        setOts(listaOts.slice(0, 5)); // Solo las últimas 5
      }
    }
    cargarDatos();
  }, []);

  return (
    <>
      <NavBar />
      <div className="dashboard-container">
        <h1 className="titulo">Panel de Control</h1>

        <div className="layout-grid">
          
          {/* COLUMNA IZQUIERDA: TABLA DE ÚLTIMOS REGISTROS */}
          <div className="tabla-box">
            <h3 style={{marginTop:0, borderBottom:'3px solid #333', paddingBottom:'10px', marginBottom:'20px'}}>
              Últimas Órdenes Registradas
            </h3>
            
            <div className="tabla-scroll">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Estado</th>
                    <th>Fecha Inicio</th>
                    <th>Responsable</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ots.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No hay actividad reciente.</td></tr>
                  ) : (
                    ots.map((ot) => (
                      <tr key={ot.id_ot}>
                        <td><strong>{ot.codigo}</strong></td>
                        <td>
                          <span className={`badge-estado ${ot.estado.toLowerCase().replace(' ', '-')}`}>
                            {ot.estado}
                          </span>
                        </td>
                        <td>{ot.fecha_inicio_contrato?.slice(0, 10) || "N/A"}</td>
                        <td>{ot.responsable_nombre || "Sin Asignar"}</td>
                        <td>
                           <Link to={`/detalle/${ot.id_ot}`} className="btn-ver-sm">Ver</Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div style={{marginTop: '20px', textAlign: 'center'}}>
               <Link to="/lista-ot" style={{color: '#007bff', textDecoration: 'none', fontWeight: 'bold'}}>
                 Ver todas las órdenes &rarr;
               </Link>
            </div>
          </div>

          {/* COLUMNA DERECHA: SIDEBAR (RESUMEN Y ACCIONES) */}
          <div className="sidebar-column">
            
            {/* 1. Panel de Estadísticas */}
            <div className="panel-registros">
              <h3>Estado Actual</h3>
              <div className="panel-card total">
                <span>Total OT</span> <b>{stats.total}</b>
              </div>
              <div className="panel-card pendiente">
                <span>Pendientes</span> <b>{stats.pendientes}</b>
              </div>
              <div className="panel-card proceso">
                <span>En Proceso</span> <b>{stats.en_proceso}</b>
              </div>
              <div className="panel-card finalizada">
                <span>Finalizadas</span> <b>{stats.finalizadas}</b>
              </div>
            </div>

            {/* 2. Accesos Directos */}
            <div className="panel-acciones-masivas">
              <h3 style={{margin: '0 0 10px 0', fontSize:'16px', color:'#555', textAlign:'center'}}>Accesos Rápidos</h3>
              
              <Link to="/crear-ot" className="btn-sidebar crear">
                + Nueva Orden
              </Link>
              
              <Link to="/lista-ot" className="btn-sidebar azul">
                📁 Gestionar OTs
              </Link>
              
              {!isCliente && (
                <Link to="/GestionUser" className="btn-sidebar gris">
                  👥 Usuarios
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;