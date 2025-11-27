import React from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./Dashboard.css"
import { getOTs } from "../services/otService";
import { Link, useParams } from "react-router-dom";
const Dashboard = () => {
  const [ots, setOts] = useState([]);

  const { id } = useParams();
  const usuario = JSON.parse(localStorage.getItem("usuarioActual"));

  // Cargar las OT reales desde la BD
  useEffect(() => {
    async function cargarOTs() {
      const data = await getOTs(); // ahora obtiene desde backend
      setOts(data);
    }
    cargarOTs();
  }, []);

  // Contadores dinámicos
  const totalOT = ots.length;

  const pendientes = ots.filter(ot => ot.estado === "Pendiente").length;
  const enProceso = ots.filter(ot => ot.estado === "En Proceso").length;
  const finalizadas = ots.filter(
    ot => ot.estado === "Finalizada" || ot.estado === "Completada"
  ).length;
  return (
  <><NavBar />
    <div className="container">
  <h1 className="title">Simtexx Inicio</h1>

  <div className="subtittle">
    Usuario: <b>{usuario?.nombre}</b> &nbsp;&nbsp; Rol: <b>{usuario?.rol_nobmre}</b>
  </div>

  <div className="cardContainer">
    <Link to="/crearot/${usuario?.id}" className="card">Crear OT</Link>
    <Link to="/listaot/${usuario?.id}" className="card">Órdenes de Trabajo</Link>
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
    <h2 className="table-title">Listado de Órdenes de Trabajo</h2>

    <table>
      <thead>
        <tr>
          <th>Código</th>
          <th>Estado</th>
          <th>Fecha Creación</th>
          <th>Última Actualización</th>
          <th>Responsable</th>
        </tr>
      </thead>

      <tbody>
        {ots.length === 0 && (
        <tr>
          <td colSpan="5" style={{ textAlign: "center", padding: "15px" }}>
            No hay órdenes registradas
          </td>
        </tr>
      )}

      {ots.map((ot) => (
        <tr key={ot.id}>
          <td>{ot.id}</td>
          <td>{ot.estado}</td>
          <td>{ot.fechaInicio || "N/A"}</td>
          <td>{ot.fechaFin || "N/A"}</td>
          <td>{ot.responsable}</td>
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

