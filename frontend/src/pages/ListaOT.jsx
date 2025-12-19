import { getOTs, deleteOTBackend, exportCSV, exportPDF, importCSV } from "../services/otService"; 
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./ListaOT.css";

export default function ListaOT() {
  const [ots, setOts] = useState([]);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    busqueda: "",
    estado: "Todos",
    fechaInicio: "",
    fechaFin: ""
  });

  const userStr = localStorage.getItem("usuarioActual");
  const usuario = userStr ? JSON.parse(userStr) : { nombre: "Sin Usuario", rol: "Invitado", id: 0 };
  
  const { id } = useParams();

  // Función para cargar datos
  const cargarDatos = async () => {
    try {
      const data = await getOTs(filtros, usuario);
      if (Array.isArray(data)) {
        setOts(data);
      } else {
        setOts([]); 
      }
    } catch (error) {
      console.error("Error cargando OTs:", error);
      setOts([]);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [filtros]);

  const handleFiltro = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  // --- LÓGICA DE IMPORTACIÓN ---
  const handleImportar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!window.confirm("¿Importar este archivo CSV? Asegúrate de que los correos de usuario existan.")) return;

    try {
        const resultado = await importCSV(file);
        alert(`Importación Finalizada:\n- Creadas: ${resultado.creadas}\n- Errores: ${resultado.errores.length}\n\n${resultado.errores.join('\n')}`);
        cargarDatos(); // Recargar la tabla
    } catch (error) {
        alert("Error al importar: " + error.message);
    }
    e.target.value = null; // Limpiar input
  };

  // --- LÓGICA DE ELIMINAR ---
  const handleDelete = async (idOT) => {
    if (window.confirm("¿Estás seguro de eliminar esta OT?")) {
        try {
          await deleteOTBackend(idOT);
          alert("OT eliminada correctamente");
          cargarDatos(); 
        } catch (error) {
          alert("No se pudo eliminar la OT");
        }
      }
  };

  const listaSegura = ots || [];
  const pendientes = listaSegura.filter((o) => o?.estado === "Pendiente").length;
  const enProceso = listaSegura.filter((o) => o?.estado === "En Proceso").length;
  const finalizadas = listaSegura.filter((o) => o?.estado === "Finalizada").length;

  return (
    <>
      <NavBar />

      <div className="listaot-container">
        <h1 className="titulo">Gestión de OTS</h1>

        <div className="user-info-box">
          <div>Usuario: <b>{usuario?.nombre}</b> &nbsp;&nbsp; Rol: <b>{usuario?.rol}</b></div>
        </div>
        
        <div className="btn-bar">
          <Link to={`/crearot/${usuario?.id || 0}`} className="btn-opcion">Crear OT</Link>
          <button className="btn-opcion" onClick={exportPDF}>Exportar PDF</button>
          <button className="btn-opcion" onClick={exportCSV}>Exportar CSV</button>
          
          {/* BOTÓN IMPORTAR */}
          <input 
            type="file" 
            id="input-csv" 
            accept=".csv" 
            style={{ display: 'none' }} 
            onChange={handleImportar} 
          />
          <label htmlFor="input-csv" className="btn-opcion" style={{cursor: 'pointer', backgroundColor: '#2e7d32'}}>
            Importar CSV
          </label>

          <Link to={`/dashboard/${usuario?.id || 0}`} className="btn-opcion">Inicio</Link>
        </div>

        <div className="layout-grid">
          
          <div className="tabla-box">
            
            <div className="tabla-header" style={{gap:'10px', flexWrap:'wrap'}}>
              <input
                className="input-buscar"
                type="text"
                name="busqueda"
                placeholder="Título / Código..."
                value={filtros.busqueda}
                onChange={handleFiltro}
              />
              <input type="date" name="fechaInicio" className="input-filtro" style={{width:'auto'}} onChange={handleFiltro} />
              <input type="date" name="fechaFin" className="input-filtro" style={{width:'auto'}} onChange={handleFiltro} />
              <select className="input-filtro" name="estado" onChange={handleFiltro} value={filtros.estado}>
                <option value="Todos">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Finalizada">Finalizada</option>
              </select>
            </div>

            {listaSegura.length === 0 ? (
                <div style={{padding:'20px', textAlign:'center', color: '#666'}}>
                    No hay datos disponibles.
                </div>
            ) : (
                <table className="tabla">
                <thead>
                    <tr>
                    <th>Código</th>
                    <th>Título</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {listaSegura.map((ot) => (
                    <tr key={ot.id_ot || Math.random()}> 
                        <td>{ot.codigo}</td>
                        <td>{ot.titulo}</td>
                        <td>{ot.estado}</td>
                        <td className="acciones-ot">
                        <Link className="btn-ver" to={`/detalle/${ot.id_ot}`}>
                            Ver
                        </Link>
                        <button className="btn-eliminar" onClick={() => handleDelete(ot.id_ot)}>
                            Eliminar
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            )}
          </div>

          <div className="panel-registros">
            <h3>Registros</h3>
            <div className="panel-card total">
              <span>Total OT</span>
              <b>{listaSegura.length}</b>
            </div>
            <div className="panel-card pendiente">
              <span>Pendientes</span>
              <b>{pendientes}</b>
            </div>
            <div className="panel-card proceso">
              <span>En proceso</span>
              <b>{enProceso}</b>
            </div>
            <div className="panel-card finalizada">
              <span>Finalizadas</span>
              <b>{finalizadas}</b>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}