import { getOTs, deleteOT, deleteOTBackend } from "../services/otService";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./ListaOT.css";

export default function ListaOT() {
  const [ots, setOts] = useState(() => getOTs());

  useEffect(() => {
    // Este efecto no hace nada, solo marcamos que los datos se inicializan en useState
  }, []);
  const usuario = JSON.parse(localStorage.getItem("usuarioActual")); //usuario


  const handleDelete = async (idOT) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta OT?")) {

      if (typeof deleteOTBackend === 'function') {
          try {
            await deleteOTBackend(idOT);
          } catch {
            console.error("Error en backend, continuando localmente...");
          }
      }

      deleteOT(idOT);
      setOts(getOTs());
      alert("OT eliminada correctamente");
    }
  };


  return (
    <>
      <NavBar />

      <div className="listaot-container">

        <h1 className="titulo">Gestión de OTS</h1>


        <div className="user-info-box">
          <div>Usuario: <b>{usuario?.nombre}</b> &nbsp;&nbsp; Rol: <b>{usuario?.rol_nombre}</b></div>
        </div>


        <div className="btn-bar">
          <Link to="/crearot/${usuario?.id}" className="btn-opcion">Crear OT</Link>
          <button className="btn-opcion">Exportar PDF</button>
          <button className="btn-opcion">Exportar CSV</button>
          <Link to="/dashboard/${usuario?.id}" className="btn-opcion">inicio</Link>


        </div>

        <div className="layout-grid">


          <div className="tabla-box">

            <div className="tabla-header">
              <input
                className="input-buscar"
                type="text"
                placeholder="Nombre Cliente / Código"
              />

              <select className="input-filtro">
                <option>Todos</option>
                <option>Pendiente</option>
                <option>En Proceso</option>
                <option>Finalizada</option>
              </select>
            </div>

            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {ots.map((ot) => (
                  <tr key={ot.id_ot}>
                    <td>{ot.codigo}</td>
                    <td>{ot.titulo}</td>
                    <td>{ot.responsable_nombre}</td>
                    <td>{ot.estado}</td>
                    <td>
                      <Link className="btn-ver" to={`/detalle/${ot.id}`}>
                        Ver
                      </Link>
                      <button
                        onClick={() => handleDelete(ot.id)}
                        className="btn-eliminar"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>


          <div className="panel-registros">
            <h3>Registros</h3>

            <div className="panel-card total">
              <span>Total OT</span>
              <b>{ots.length}</b>
            </div>

            <div className="panel-card pendiente">
              <span>Pendientes</span>
              <b>{ots.filter((o) => o.estado === "Pendiente").length}</b>
            </div>

            <div className="panel-card proceso">
              <span>En proceso</span>
              <b>{ots.filter((o) => o.estado === "En Proceso").length}</b>
            </div>

            <div className="panel-card finalizada">
              <span>Finalizadas</span>
              <b>{ots.filter((o) => o.estado === "Finalizada").length}</b>
            </div>
          </div>

        </div>

      </div>

      <Footer />
    </>
  );
}


