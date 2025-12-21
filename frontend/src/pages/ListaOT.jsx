import { getOTs, deleteOTBackend, exportCSV, importCSV } from "../services/otService";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserFromToken } from "../utils/auth"; 
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./ListaOT.css";

export default function ListaOT() {
  const [ots, setOts] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  
  const usuario = getUserFromToken() || { nombre: "Usuario", rol_id: 0 };
  const isCliente = usuario.rol_id === 2;
  const isMantenedor = usuario.rol_id === 3;

  const cargarDatos = async () => {
    try {
      // Enviamos todos los filtros al backend
      const filtros = { 
        busqueda, 
        estado: filtroEstado,
        fechaInicio,
        fechaFin
      };
      
      const data = await getOTs(filtros);
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
  }, []); // Carga inicial

  const handleFiltrar = () => {
    cargarDatos();
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta OT?")) {
      await deleteOTBackend(id);
      cargarDatos();
    }
  };

  const handleExport = () => {
    exportCSV({ busqueda, estado: filtroEstado, fechaInicio, fechaFin });
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        const res = await importCSV(file);
        alert(res.message || "Importación finalizada");
        cargarDatos();
    } catch (e) {
        alert("Error al importar");
    }
  };

  // Estadísticas locales basadas en la vista actual
  const total = ots.length;
  const pendientes = ots.filter(o => o.estado === "Pendiente").length;
  const proceso = ots.filter(o => o.estado === "En Proceso").length;
  const finalizadas = ots.filter(o => o.estado === "Finalizada").length;

  return (
    <>
      <NavBar />
      
      <div className="listaot-container">
        
        <h1 className="titulo">Gestión de OTs</h1>

        <div className="header-controls">
            <div className="user-info-box">
            Hola, <strong>{usuario.nombre}</strong> ({usuario.rol})
            </div>

            {/* Barra de Botones */}
            <div className="btn-bar">
            <Link to="/crear-ot" className="btn-opcion">+ Nueva OT</Link>
            <button onClick={handleExport} className="btn-opcion">📊 Exportar CSV</button>
            {!isCliente && (
                <div style={{position: 'relative', display: 'inline-block'}}>
                    <input type="file" id="importar-csv" style={{display: 'none'}} accept=".csv" onChange={handleImport}/>
                    <label htmlFor="importar-csv" className="btn-opcion" style={{cursor:'pointer', margin:0}}>📥 Importar CSV</label>
                </div>
            )}
            </div>
        </div>

        {/* ESTRUCTURA GRID: Tabla Izquierda (Grande) - Resumen Derecha (Pequeño) */}
        <div className="layout-grid">
          
          <div className="tabla-box">
            <div className="tabla-header">
              <input 
                type="text" 
                placeholder="🔍 Buscar..." 
                className="input-buscar"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              
              {/* Nuevos Filtros de Fecha */}
              <input 
                type="date" 
                className="input-filtro"
                value={fechaInicio}
                onChange={e => setFechaInicio(e.target.value)}
                title="Fecha Inicio"
              />
              <input 
                type="date" 
                className="input-filtro"
                value={fechaFin}
                onChange={e => setFechaFin(e.target.value)}
                title="Fecha Fin"
              />

              <select 
                className="input-filtro"
                value={filtroEstado} 
                onChange={e => setFiltroEstado(e.target.value)}
              >
                <option value="">Todos los Estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Finalizada">Finalizada</option>
              </select>

              <button onClick={handleFiltrar} className="btn-filtrar-accion">Filtrar</button>
            </div>

            <div className="tabla-scroll">
                <table className="tabla">
                <thead>
                    <tr>
                    <th>Código</th>
                    <th>Título</th>
                    <th>Estado</th>
                    <th>F. Inicio</th>
                    <th>F. Fin</th> {/* Columna Nueva */}
                    <th>Responsable</th> {/* Columna Nueva */}
                    <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {ots.length > 0 ? (
                    ots.map((ot) => (
                        <tr key={ot.id_ot}>
                        <td><strong>{ot.codigo}</strong></td>
                        <td>{ot.titulo}</td>
                        <td>
                            <span style={{
                            padding:'4px 8px', borderRadius:'12px', fontSize:'11px', fontWeight:'bold',
                            backgroundColor: ot.estado === 'Finalizada' ? '#d4edda' : ot.estado === 'En Proceso' ? '#d1ecf1' : '#fff3cd',
                            color: ot.estado === 'Finalizada' ? '#155724' : ot.estado === 'En Proceso' ? '#0c5460' : '#856404'
                            }}>
                            {ot.estado}
                            </span>
                        </td>
                        <td>{ot.fecha_inicio_contrato ? new Date(ot.fecha_inicio_contrato).toLocaleDateString() : '-'}</td>
                        <td>{ot.fecha_fin_contrato ? new Date(ot.fecha_fin_contrato).toLocaleDateString() : '-'}</td>
                        <td>{ot.responsable_nombre || "Sin Asignar"}</td>
                        <td className="acciones-ot">
                            <Link to={`/detalle/${ot.id_ot}`} className="btn-ver">Ver</Link>
                            {!isCliente && !isMantenedor && (
                            <button className="btn-eliminar" onClick={() => handleDelete(ot.id_ot)}>🗑</button>
                            )}
                        </td>
                        </tr>
                    ))
                    ) : (
                    <tr>
                        <td colSpan="7" style={{textAlign:'center', padding:'20px'}}>No se encontraron órdenes.</td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
          </div>

          {/* Panel Resumen Lateral */}
          <div className="panel-registros">
            <h3>Resumen</h3>
            <div className="panel-card total">
              <span>Total</span> <b>{total}</b>
            </div>
            <div className="panel-card pendiente">
              <span>Pendientes</span> <b>{pendientes}</b>
            </div>
            <div className="panel-card proceso">
              <span>En Proceso</span> <b>{proceso}</b>
            </div>
            <div className="panel-card finalizada">
              <span>Finalizadas</span> <b>{finalizadas}</b>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}