import { getOTs } from "../services/otService";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./ListaOT.css";

export default function ListaOT() {
  const [ots, setOts] = useState([]);
  
  // PROTECCIÓN 1: Valores por defecto en los filtros
  const [filtros, setFiltros] = useState({
    busqueda: "",
    estado: "Todos",
    fechaInicio: "",
    fechaFin: ""
  });

  // PROTECCIÓN 2: Evitar que la página explote si no hay usuario en localStorage
  // Si devuelve null, usamos un usuario "fantasma" para que la UI cargue igual
  const userStr = localStorage.getItem("usuarioActual");
  const usuario = userStr ? JSON.parse(userStr) : { nombre: "Sin Usuario", rol: "Invitado", id: 0 };
  
  const { id } = useParams();

  // Función para cargar datos
  const cargarDatos = async () => {
    try {
      const data = await getOTs(filtros, usuario);
      // PROTECCIÓN 3: Asegurar que data sea un array antes de guardarlo
      if (Array.isArray(data)) {
        setOts(data);
      } else {
        console.error("La API no devolvió un array:", data);
        setOts([]); // Array vacío para no romper el .map
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

  // Cálculos seguros para los paneles
  // Usamos el operador '|| []' por seguridad extra
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
          {/* Usamos ?. para acceso seguro */}
          <div>Usuario: <b>{usuario?.nombre}</b> &nbsp;&nbsp; Rol: <b>{usuario?.rol}</b></div>
        </div>
        
        <div className="btn-bar">
          {/* Enlaces protegidos con ID por defecto (0) si no existe */}
          <Link to={`/crearot/${usuario?.id || 0}`} className="btn-opcion">Crear OT</Link>
          <button className="btn-opcion">Exportar PDF</button>
          <button className="btn-opcion">Exportar CSV</button>
          <Link to={`/dashboard/${usuario?.id || 0}`} className="btn-opcion">Inicio</Link>
        </div>

        <div className="layout-grid">
          
          <div className="tabla-box">
            
            {/* Inputs de Filtro */}
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

            {/* TABLA - Renderizado condicional seguro */}
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
                    // Usamos ot?.id por seguridad
                    <tr key={ot.id_ot || ot.id || Math.random()}> 
                        <td>{ot.codigo}</td>
                        <td>{ot.titulo}</td>
                        <td>{ot.estado}</td>
                        <td>
                        <Link className="btn-ver" to={`/detalle/${ot.id_ot || ot.id}`}>
                            Ver
                        </Link>
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