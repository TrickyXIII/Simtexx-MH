import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./Dashboard.css";
import { getOTs, getDashboardStats } from "../services/otService"; // Importamos el nuevo servicio
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [ots, setOts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    en_proceso: 0,
    finalizadas: 0
  });

  const usuarioString = localStorage.getItem("usuarioActual");
  const usuario = usuarioString ? JSON.parse(usuarioString) : { nombre: "Invitado", rol: "Invitado", id: 0 };

  useEffect(() => {
    async function cargarDatos() {
      // 1. Cargar Estadísticas
      const estadisticas = await getDashboardStats(usuario);
      setStats(estadisticas);

      // 2. Cargar Lista Reciente (Limitada a 5)
      const listaOts = await getOTs({}, usuario);
      if (Array.isArray(listaOts)) {
        setOts(listaOts.slice(0, 5));
      }
    }
    cargarDatos();
  }, []);

  return (
    <>
      <NavBar />
      <div className="container">
        <h1 className="title">Simtexx Inicio</h1>

        <div className="subtittle">
          Usuario: <b>{usuario?.nombre}</b> &nbsp;&nbsp; Rol: <b>{usuario?.rol_nombre || usuario?.rol}</b>
        </div>

        <div className="cardContainer">
          <Link to={`/crearot/${usuario?.id}`} className="card">Crear OT</Link>
          <Link to={`/listaot/${usuario?.id}`} className="card">Órdenes de Trabajo</Link>
          <Link to="/GestionUser" className="card">Usuarios</Link>
        </div>

        <div className="panel-resumen">
          <h2 className="panel-title">Panel Resumen de OT (Tiempo Real)</h2>

          <div className="panel-items">
            <div className="panel-item">Total OT <strong>{stats.total}</strong></div>
            <div className="panel-item">Pendientes <strong>{stats.pendientes}</strong></div>
            <div className="panel-item">En Proceso <strong>{stats.en_proceso}</strong></div>
            <div className="panel-item">Finalizadas <strong>{stats.finalizadas}</strong></div>
          </div>
        </div>

        <div className="table-container">
          <h2 className="table-title">Últimas Órdenes Registradas</h2>

          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Estado</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Responsable</th>
              </tr>
            </thead>

            <tbody>
              {ots.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "15px" }}>
                    No hay órdenes registradas recientemente
                  </td>
                </tr>
              )}

              {ots.map((ot) => (
                <tr key={ot.id_ot}>
                  <td>{ot.codigo}</td>
                  <td>{ot.estado}</td>
                  <td>{ot.fecha_inicio_contrato?.slice(0, 10) || "N/A"}</td>
                  <td>{ot.fecha_fin_contrato?.slice(0, 10) || "N/A"}</td>
                  <td>{ot.responsable_nombre || "Sin Asignar"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Dashboard;