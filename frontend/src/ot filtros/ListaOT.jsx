import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { getOTs } from '../services/otService';
import './ListaOT.css';
import { Link } from 'react-router-dom';

const ListaOT = () => {
    const [ots, setOts] = useState([]);
    const [filteredOts, setFilteredOts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        estado: '',
        responsable: '',
        fechaInicio: '',
        fechaFin: '',
    });
    const [message, setMessage] = useState('');

    const usuarioString = localStorage.getItem("usuarioActual");
    const usuario = usuarioString ? JSON.parse(usuarioString) : { id: null, rol: 'User', nombre: '' };
    const isAdmin = usuario.rol === 'Admin';

    const uniqueResponsables = [...new Set(ots.map(ot => ot.responsable))].sort();

    useEffect(() => {
        const loadOTs = async () => {
            try {
                const allData = await getOTs();
                setOts(allData);
            } catch {
                setMessage('Error al cargar datos. Verifique la conexión con el backend.');
            } finally {
                setLoading(false);
            }
        };
        loadOTs();
    }, []);

    useEffect(() => {
        let results = [...ots];
        let messageText = '';

        if (!isAdmin) {
            results = results.filter(ot => ot.responsable === usuario.nombre);
        }

        if (filter.estado) {
            results = results.filter(ot => ot.estado === filter.estado);
        }

        if (filter.responsable) {
            results = results.filter(ot => ot.responsable === filter.responsable);
        }

        if (filter.fechaInicio && filter.fechaFin) {
            const start = new Date(filter.fechaInicio);
            const end = new Date(filter.fechaFin);

            results = results.filter(ot => {
                const otStart = new Date(ot.fechaInicio);
                const otEnd = new Date(ot.fechaFin);

                const startsAfterFilter = otStart >= start;
                const endsBeforeFilter = otEnd <= end;

                return startsAfterFilter && endsBeforeFilter;
            });
        }

        if (ots.length > 0 && results.length === 0 && !loading) {
            messageText = 'No se encontraron Órdenes de Trabajo con los filtros seleccionados.';
        }

        setFilteredOts(results);
        setMessage(messageText);

    }, [ots, filter, isAdmin, loading, usuario.nombre]);

    const handleFilterChange = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value });
    };

    const resetFilters = () => {
        setFilter({
            estado: '',
            responsable: '',
            fechaInicio: '',
            fechaFin: '',
        });
        setMessage('');
    };

    if (loading) {
        return (
            <div className="text-center p-8">
                <h1>Cargando Órdenes de Trabajo...</h1>
            </div>
        );
    }

    return (
        <><NavBar />
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-6">Listado de Órdenes de Trabajo</h1>
                <p className="mb-4">Rol actual: <b>{usuario.rol}</b> - {isAdmin ? "Viendo todas las OTs del sistema" : `Viendo solo OTs asignadas a ${usuario.nombre}`}</p>

                {/* Área de Filtros */}
                <div className="filter-panel p-4 bg-gray-100 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold mb-3">Filtros de Búsqueda</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                        {/* Filtro por Estado */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Estado</label>
                            <select
                                name="estado"
                                value={filter.estado}
                                onChange={handleFilterChange}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Todos</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="En Proceso">En Proceso</option>
                                <option value="Finalizada">Finalizada</option>
                            </select>
                        </div>

                        {/* Filtro por Responsable */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Responsable</label>
                            <select
                                name="responsable"
                                value={filter.responsable}
                                onChange={handleFilterChange}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Todos</option>
                                {uniqueResponsables.map(resp => (
                                    <option key={resp} value={resp}>{resp}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Fecha de Inicio */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha Contrato (Desde)</label>
                            <input
                                type="date"
                                name="fechaInicio"
                                value={filter.fechaInicio}
                                onChange={handleFilterChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        {/* Filtro por Fecha de Fin */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha Contrato (Hasta)</label>
                            <input
                                type="date"
                                name="fechaFin"
                                value={filter.fechaFin}
                                onChange={handleFilterChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                         <button
                            onClick={resetFilters}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                </div>

                {/* Mensajes y Listado de Órdenes */}
                {message && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
                        {message}
                    </div>
                )}

                <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° OT</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título/Descripción Breve</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">F. Inicio Contrato</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">F. Fin Contrato</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOts.map(ot => (
                                <tr key={ot.id} className="hover:bg-gray-50 cursor-pointer">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                                        <Link to={`/detalleot/${ot.id}`}>{ot.id}</Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ot.nombre}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ot.estado === 'Finalizada' ? 'bg-green-100 text-green-800' : ot.estado === 'En Proceso' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                            {ot.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ot.fechaInicio}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ot.fechaFin}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ot.responsable}</td>
                                </tr>
                            ))}
                            {filteredOts.length === 0 && !loading && message === '' && (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-gray-500">
                                        No se encontraron Órdenes de Trabajo.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ListaOT;
