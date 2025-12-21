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
  }, []);

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

  // --- MODIFICACIÓN AQUÍ: Mejor manejo de reporte de errores ---
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Resetear el input para permitir subir el mismo archivo si falla y se corrige
    e.target.value = null;

    try {
        const res = await importCSV(file);
        
        // Construimos un mensaje detallado
        let mensaje = res.message || "Proceso finalizado";
        
        if (res.creadas !== undefined) {
             mensaje += `\n\n✅ Registros creados exitosamente: ${res.creadas}`;
        }
        
        // Si el backend reporta errores específicos por fila
        if (res.errores && res.errores.length > 0) {
            mensaje += `\n\n⚠️ Se encontraron ${res.errores.length} errores que impidieron la carga de ciertas filas:\n`;
            // Mostramos los primeros 5 errores para no hacer la alerta gigante
            mensaje += res.errores.slice(0, 5).join("\n");
            
            if (res.errores.length > 5) {
                mensaje += `\n... y ${res.errores.length - 5} errores más.`;
            }
        }

        alert(mensaje);
        cargarDatos();
    } catch (err) {
        console.error(err);
        alert(err.message || "Error crítico al intentar importar el archivo.");
    }
  };

  const total = ots.length;
  const pendientes = ots.filter(o => o.estado === "Pendiente").length;
  const proceso = ots.filter(o => o.estado === "En Proceso").length;
  const finalizadas = ots.filter(o => o.estado === "Finalizada").length;

  return (
    <>
      <NavBar />
      
      <div className="listaot-container">
        
        <h1 className="titulo">Gestión de OTs</h1>

        {/* ESTRUCTURA GRID */}
        <div className="layout-grid">
          
          {/* Columna Izquierda: Tabla */}
          <div className="tabla-box">
            <div className="tabla-header">
              <input 
                type="text" 
                placeholder="🔍 Buscar..." 
                className="input-buscar"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              
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
                <option value="">Todos</option>
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
                    <th>Cliente</th> {/* NUEVA COLUMNA */}
                    <th>F. Inicio</th>
                    <th>F. Fin</th>
                    <th>Responsable</th>
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
                            <span className={`badge-estado ${ot.estado.toLowerCase().replace(' ', '-')}`}>
                              {ot.estado}
                            </span>
                        </td>
                        {/* NUEVA CELDA CLIENTE */}
                        <td>{ot.cliente_nombre || "Sin Asignar"}</td>
                        
                        <td>{ot.fecha_inicio_contrato ? new Date(ot.fecha_inicio_contrato).toLocaleDateString() : '-'}</td>
                        <td>{ot.fecha_fin_contrato ? new Date(ot.fecha_fin_contrato).toLocaleDateString() : '-'}</td>
                        <td>{ot.responsable_nombre || "Sin Asignar"}</td>
                        <td className="acciones-ot">
                            <Link to={`/detalle/${ot.id_ot}`} className="btn-ver">Ver</Link>
                            {!isCliente && !isMantenedor && (
                            <button className="btn-eliminar" onClick={() => handleDelete(ot.id_ot)}>Eliminar</button>
                            )}
                        </td>
                        </tr>
                    ))
                    ) : (
                    <tr>
                        <td colSpan="8" style={{textAlign:'center', padding:'20px'}}>No se encontraron órdenes.</td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
          </div>

          {/* Columna Derecha: Sidebar */}
          <div className="sidebar-column">
            
            {/* 1. Panel Resumen */}
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

            {/* 2. Botones de Acción (Sidebar) */}
            <div className="panel-acciones-masivas">
               
               {/* BOTÓN 1: CREAR OT */}
               <Link to="/crear-ot" className="btn-sidebar crear">
                 + Nueva Orden de Trabajo
               </Link>

               {/* BOTÓN 2: EXPORTAR (Oculto para Clientes) */}
               {!isCliente && (
                 <button onClick={handleExport} className="btn-sidebar exportar">
                   📊 Exportar a Excel/CSV
                 </button>
               )}
               
               {/* BOTÓN 3: IMPORTAR (Oculto para Clientes) */}
               {!isCliente && (
                  <div className="upload-wrapper">
                      <input 
                        type="file" 
                        id="importar-csv" 
                        style={{display: 'none'}} 
                        accept=".csv" 
                        onChange={handleImport}
                      />
                      <label htmlFor="importar-csv" className="btn-sidebar importar">
                        📥 Importar desde CSV
                      </label>
                  </div>
               )}
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}