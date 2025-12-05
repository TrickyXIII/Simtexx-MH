import { getOTs, deleteOTBackend, exportCSV, exportPDF } from "../services/otService"; 
import { Link, useParams} from "react-router-dom";
import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./ListaOT.css";

export default function ListaOT() {
  //CARGAR OTS //
  const [ots, setOts] = useState([]);

  useEffect(() => {
      async function cargarOTs() {
        const data = await getOTs(); // ahora obtiene desde backend
        setOts(data);
      }
      cargarOTs();
    }, []);


  //ID DE BUSQUEDA USUARIO //
  const { id } = useParams();
  const usuario = JSON.parse(localStorage.getItem("usuarioActual")); //usuario
 
 
  // FUNCION DE SEARCH Y FILTRO //
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [filteredOTs, setFilteredOTs] = useState([]);

  useEffect(() => {
    filtrarOTs();
  }, [ots, search, estadoFiltro]);

  const filtrarOTs = () => {
    
    let data = ots;
    
                                
    if (search.trim() !== "") {      // Buscar por Código o Cliente
      const buscar = search.toLowerCase();
      data = data.filter(
        (ot) =>
          ot.codigo.toLowerCase().includes(buscar) ||
          ot.cliente_nombre.toLowerCase().includes(buscar)
      );
    }
    
    if (estadoFiltro !== "Todos") {    // Filtrar por Estado
      data = data.filter((ot) => ot.estado === estadoFiltro);
    }

    setFilteredOTs(data);
  };

  
  //DELETE BTN // 
  const handleDelete = async (idOT) => {
  if (window.confirm("¿Estás seguro de eliminar esta OT?")) {

      try {
        await deleteOTBackend(idOT);
        const data = await getOTs(); // recarga desde la base de datos
        setOts(data);
        alert("OT eliminada correctamente");
      } catch (error) {
        console.error("Error al eliminar OT:", error);
        alert("No se pudo eliminar la OT");
      }
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
          <button className="btn-opcion" onClick={exportPDF} >Exportar PDF</button>
          <button className="btn-opcion"onClick={exportCSV}>Exportar CSV</button>
          <Link to="/dashboard" className="btn-opcion">inicio</Link>
          
          
        </div>

        <div className="layout-grid">

          
          <div className="tabla-box">

            <div className="tabla-header">
              <input
                className="input-buscar"
                type="text"
                placeholder="Nombre Cliente / Código"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select className="input-filtro"
              value={estadoFiltro}
              onChange={(e) =>setEstadoFiltro(e.target.value)}>
                <option>Todos</option>
                <option>Pendiente</option>
                <option>En Proceso</option>
                <option>Finalizada</option>
              </select>
            </div>

            <table className="tabla">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Cliente</th>
                  <th>Nombre</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                  <th>Ultima Actualizacion</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredOTs.map((ot) => (
                  <tr key={ot.id_ot}>
                    <td>{ot.codigo}</td>
                    <td>{ot.cliente_nombre}</td>
                    <td>{ot.titulo}</td>
                    <td>{ot.responsable_nombre}</td>
                    <td>{ot.estado}</td>
                    <td>{ot.fecha_actualizacion?.split("T")[0]}</td>
                    <td className="acciones-ot">
                      <Link className="btn-ver" to={`/detalle/${ot.id_ot}`}>
                        Ver
                      </Link>
                      <button 
                        onClick={() => handleDelete(ot.id_ot)} 
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


