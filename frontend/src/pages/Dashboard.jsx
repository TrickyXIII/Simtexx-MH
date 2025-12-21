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

  // Manejo seguro del usuario
  const usuario = getUserFromToken() || { nombre: "Usuario", rol: "Invitado", id: 0, rol_id: 0 };
  const isCliente = usuario.rol_id === 2;

  useEffect(() => {
    async function cargarDatos() {
      try {
        const estadisticas = await getDashboardStats();
        if(estadisticas) setStats(estadisticas);

        const listaOts = await getOTs({});
        if (Array.isArray(listaOts)) {
          setOts(listaOts.slice(0, 5)); // Mostrar solo las últimas 5
        }
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      }
    }
    cargarDatos();
  }, []);

  return (
    <>
      <NavBar />
      <div className="container">
        <h1 className="title">Panel de Control</h1>

        <div className="subtittle">
          Bienvenido, <b>{usuario.nombre}</b> <br/> 
          <span style={{fontSize:'0.9em', color:'#555'}}>Perfil: {usuario.rol}</span>
        </div>

        <div className="cardContainer">
          {/* CORRECCIÓN DE RUTAS AQUÍ */}
          <Link to="/crear-ot" className="card">Nueva Solicitud (OT)</Link>
          <Link to="/lista-ot" className="card">Ver Mis Órdenes</Link>
          
          {/* Solo administradores y mantenedores ven gestión de usuarios */}
          {!isCliente && <Link to="/GestionUser" className="card">Gestionar Usuarios</Link>}
        </div>

        <div className="panel-resumen">
          <h2 className="panel-title">Estado de Órdenes</h2>
          <div className="panel-items">
            <div className="panel-item" style={{borderColor: '#333'}}>Total <strong>{stats.total}</strong></div>
            <div className="panel-item" style={{borderColor: '#ffc107'}}>Pendientes <strong>{stats.pendientes}</strong></div>
            <div className="panel-item" style={{borderColor: '#17a2b8'}}>Proceso <strong>{stats.en_proceso}</strong></div>
            <div className="panel-item" style={{borderColor: '#28a745'}}>Finalizadas <strong>{stats.finalizadas}</strong></div>
          </div>
        </div>

        <div className="table-container">
          <h2 className="table-title">Actividad Reciente</h2>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Estado</th>
                <th>Fecha Inicio</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              {ots.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: "center", padding: "15px" }}>No hay registros recientes</td></tr>
              ) : (
                ots.map((ot) => (
                  <tr key={ot.id_ot}>
                    <td><Link to={`/detalle/${ot.id_ot}`} style={{color:'#d60000', fontWeight:'bold'}}>{ot.codigo}</Link></td>
                    <td>
                      <span style={{
                          padding:'4px 8px', borderRadius:'4px', fontSize:'12px', fontWeight:'bold',
                          background: ot.estado === 'Finalizada' ? '#d4edda' : ot.estado === 'En Proceso' ? '#d1ecf1' : '#fff3cd'
                      }}>
                        {ot.estado}
                      </span>
                    </td>
                    <td>{ot.fecha_inicio_contrato?.slice(0, 10) || "N/A"}</td>
                    <td>{ot.responsable_nombre || "Sin Asignar"}</td>
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
};

export default Dashboard;