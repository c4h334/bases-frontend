import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Monitoreo() {
    const [productos, setProductos] = useState([]);
    const [alertas, setAlertas] = useState<Record<number, string>>({});
    const [selectedBodega, setSelectedBodega] = useState('TODAS');
    const [selectedProductForMap, setSelectedProductForMap] = useState<any | null>(null);

    useEffect(() => {
        api.get('/Productos/monitoreo')
            .then(res => {
                const data = res.data;
                setProductos(data);
                data.forEach((p: any) => {
                    api.get(`/Productos/${p.idProducto}/alerta-stock`)
                        .then(r => setAlertas(prev => ({ ...prev, [p.idProducto]: r.data.estado })));
                });
            })
            .catch(err => console.error("Error al cargar monitoreo:", err));
    }, []);

    // Extraer bodegas únicas del inventario
    const bodegas = ['TODAS', ...new Set(productos.map((p: any) => p.bodega).filter(Boolean))];

    // Filtrar productos según la bodega seleccionada
    const productosFiltrados = selectedBodega === 'TODAS'
        ? productos
        : productos.filter((p: any) => p.bodega === selectedBodega);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Monitoreo de Inventario</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Control y trazabilidad de existencias en tiempo real con alertas automatizadas.
                    </p>
                </div>
                
                {/* Selector de Bodega Interactivo */}
                <div className="flex flex-wrap gap-1.5 bg-slate-100/80 border border-slate-200/50 p-1 rounded-2xl w-fit">
                    {bodegas.map(b => (
                        <button
                            key={b}
                            onClick={() => setSelectedBodega(b)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                                selectedBodega === b
                                    ? 'bg-white text-indigo-750 soft-shadow border border-slate-200/20'
                                    : 'text-slate-500 hover:text-slate-850 hover:bg-white/40'
                            }`}
                        >
                            {b === 'TODAS' ? 'Todas las Bodegas' : b}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="glass-card rounded-2xl soft-shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600 border-collapse">
                        <thead className="text-xs text-slate-500 font-bold uppercase bg-slate-50/75 border-b border-slate-200/50 tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Ubicación (Mapa)</th>
                                <th className="px-6 py-4 text-center">Existencias</th>
                                <th className="px-6 py-4">Último Ingreso</th>
                                <th className="px-6 py-4">Último Despacho</th>
                                <th className="px-6 py-4 text-right">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {productosFiltrados.map((p: any) => {
                                const isAlert = alertas[p.idProducto] === 'REORDEN';
                                return (
                                    <tr key={p.idProducto} className={`hover:bg-slate-50 transition-colors duration-150 ${isAlert ? 'bg-rose-50/70 border-l-4 border-rose-500' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800">{p.nombre}</div>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5">{p.codigo}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => setSelectedProductForMap(p)}
                                                className="text-xs font-bold text-indigo-750 bg-indigo-50/80 hover:bg-indigo-100 hover:text-indigo-900 border border-indigo-200/40 px-3 py-1.5 rounded-xl transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-3xs hover:shadow-2xs"
                                                title="Ver ubicación en mapa de estantería"
                                            >
                                                <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>{p.bodega} &bull; Pasillo {p.pasillo} &bull; Est. {p.estante}</span>
                                            </button>
                                        </td>
                                        <td className={`px-6 py-4 text-center font-extrabold text-base ${isAlert ? 'text-rose-600 font-black' : 'text-slate-800'}`}>
                                            {p.cantidadActual}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                                            {p.ultimoIngreso ? new Date(p.ultimoIngreso).toLocaleString('es-CR') : 'Sin ingresos'}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                                            {p.ultimoDespacho ? new Date(p.ultimoDespacho).toLocaleString('es-CR') : 'Sin despachos'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {isAlert ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200/50 shadow-3xs animate-pulse">
                                                    ⚠️ REORDEN
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/80 shadow-3xs">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    Listo (OK)
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {productosFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-medium">
                                        No hay productos registrados en esta bodega.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Mapa Interactivo de Estantería */}
            {selectedProductForMap && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl premium-shadow max-w-md w-full p-6 space-y-5 border border-slate-200/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="inline-flex px-3 py-1 rounded-full text-xxs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                    Bodega: {selectedProductForMap.bodega}
                                </span>
                                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight mt-2.5">{selectedProductForMap.nombre}</h3>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">Código: {selectedProductForMap.codigo}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedProductForMap(null)}
                                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Racks Visual Representation */}
                        <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-5 space-y-4">
                            <div className="text-center">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mapa de Estantería del Almacén</div>
                                <div className="text-xxs text-slate-400 font-semibold mt-1">
                                    Pasillo: <span className="text-indigo-600 font-bold">{selectedProductForMap.pasillo}</span> &bull; Estante: <span className="text-indigo-600 font-bold">{selectedProductForMap.estante}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-5 gap-2.5 pt-1">
                                {Array.from({ length: 5 }).map((_, rIdx) => {
                                    const level = 5 - rIdx; // Levels 5 down to 1
                                    return Array.from({ length: 5 }).map((_, cIdx) => {
                                        const pasilloLetter = String.fromCharCode(65 + cIdx); // A, B, C, D, E
                                        
                                        // Match check
                                        const matchesPasillo = selectedProductForMap.pasillo.toString().toUpperCase().includes(pasilloLetter);
                                        const matchesEstante = selectedProductForMap.estante.toString().includes(level.toString());
                                        const isMatch = matchesPasillo && matchesEstante;

                                        return (
                                            <div 
                                                key={`${level}-${pasilloLetter}`}
                                                className={`h-12 rounded-xl flex flex-col items-center justify-center border transition-all ${
                                                    isMatch
                                                        ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-extrabold border-indigo-650 shadow-md shadow-indigo-150/45 relative'
                                                        : 'bg-white border-slate-200/50 hover:bg-slate-50 text-slate-400'
                                                }`}
                                                title={`Pasillo ${pasilloLetter} - Estante ${level}`}
                                            >
                                                <span className="text-[9px] font-mono opacity-60">P-{pasilloLetter}</span>
                                                <span className="text-xs font-bold">E-{level}</span>
                                                {isMatch && (
                                                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-200 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-300"></span>
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    });
                                })}
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 pt-1">
                                <span>&larr; Entrada</span>
                                <span>Pasillos de Racks</span>
                                <span>Despacho &rarr;</span>
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex justify-end pt-1">
                            <button 
                                onClick={() => setSelectedProductForMap(null)}
                                className="px-5 py-2.5 bg-slate-200/70 hover:bg-slate-200 border border-slate-300/40 text-slate-700 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer shadow-xs"
                            >
                                Cerrar Vista
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
