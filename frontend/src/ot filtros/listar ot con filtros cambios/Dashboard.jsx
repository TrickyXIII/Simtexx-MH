import React, { useState, useEffect, useMemo } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./Dashboard.css"
import { getOTs } from "../services/otService";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // 1. Usamos useState porque los datos tardan en llegar de la DB
  const [ots, setOts] = useState([]);

  // 2. Recuperación segura del usuario para evitar errores
  const userStr = localStorage.getItem("usuarioActual");
  const usuario = useMemo(() =>
    userStr ? JSON.parse(userStr) : { nombre: "Invitado", rol: "Invitado", id: 0 },
    [userStr]
  );

  // 3. useEffect para cargar los datos ASÍNCRONAMENTE
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Esperamos a que el servicio responda (await)
        const data = await getOTs({}, usuario);
        // Guardamos solo si es un array válido
        if (Array.isArray(data)) {
            setOts(data);
        } else {
            setOts([]);
        }
      } catch {
        console.error("Error cargando dashboard");
        setOts([]);
      }
    };
    cargarDatos();
  }, [usuario]); // Se ejecuta una sola vez al entrar

  // 4. Cálculos seguros (si ots está vacío, no pasa nada)
  const totalOT = ots.length;
  // Usamos ?. para evitar errores si algún dato viene incompleto
  const pendientes = ots.filter(ot => ot?.estado === "Pendiente").length;
  const enProceso = ots.filter(ot => ot?.estado === "En Proceso").length;
  const finalizadas = ots.filter(ot => ot?.estado === "Finalizada" || ot?.estado === "Completada").length;

  return (
    <>
      <NavBar />
      <div className="container">
        <h1 className="title">Simtexx Inicio</h1>

        <div className="subtittle">
          Usuario: <b>{usuario.nombre}</b> &nbsp;&nbsp; Rol: <b>{usuario.rol}</b>
        </div>

        <div className="cardContainer">
          {/* Corregimos las comillas en los Links */}
          <Link to={`/crearot/${usuario.id}`} className="card">Crear OT</Link>
          <Link to={`/listaot/${usuario.id}`} className="card">Órdenes de Trabajo</Link>
          <Link to="/GestionUser" className="card">Usuarios</Link>
        </div>

        <div className="panel-resumen">
          <h2 className="panel-title">Panel Resumen de OT</h2>

          <div className="panel-items">
            <div className="panel-item">Total OT <strong>{totalOT}</strong></div>
            <div className="panel-item">Pendientes <strong>{pendientes}</strong></div>
            <div className="panel-item">En Proceso <strong>{enProceso}</strong></div>
            <div className="panel-item">Finalizadas <strong>{finalizadas}</strong></div>
          </div>
        </div>

        <div className="table-container">
          <h2 className="table-title">Listado de Órdenes de Trabajo (Recientes)</h2>

          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Estado</th>
                <th>Fechas</th>
                <th>Responsable</th>
              </tr>
            </thead>

            <tbody>
              {ots.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "15px" }}>
                    Cargando datos o no hay registros...
                  </td>
                </tr>
              )}

              {/* Mostramos las primeras 5 OTs */}
              {ots.slice(0, 5).map((ot) => (
                <tr key={ot.id_ot || ot.id}>
                  {/* Ajustamos para leer datos de BD (snake_case) o Front (camelCase) */}
                  <td>{ot.codigo}</td>
                  <td>{ot.estado}</td>
                  <td>
                    {ot.fecha_inicio_contrato || ot.fechaInicio || "N/A"}
                  </td>
                  <td>{ot.responsable_id || ot.responsable}</td>
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
