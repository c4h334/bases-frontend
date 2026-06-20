import { useState } from 'react';
import api from '../services/api';

export default function Auditoria() {
    const [codigo, setCodigo] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [movimientos, setMovimientos] = useState([]);
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState('');

    const buscar = async () => {
        setError('');
        const query = `?codigo=${codigo}${fechaInicio ? `&fechaInicio=${fechaInicio}` : ''}${fechaFin ? `&fechaFin=${fechaFin}` : ''}`;

        try {
            const resMov = await api.get(`/AuditoriaProductos/movimientos${query}`);
            setMovimientos(resMov.data);

            const resLog = await api.get(`/AuditoriaProductos/log-auditoria${query}`);
            setLogs(resLog.data);
        } catch (e: any) {
            setError(e.response?.data?.message || 'Error de conexión al servidor.');
        }
    };

    return (
        <div className="glass-card p-6 md:p-8 rounded-3xl soft-shadow min-h-[80vh] flex flex-col space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Auditoría y Trazabilidad</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Historial completo de movimientos de productos y registro automático de triggers en la Base de Datos</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 p-5 bg-slate-50/50 border border-slate-200/40 rounded-2xl">
                <div className="flex-1 min-w-[200px]">
                    <label className="text-xxs font-bold uppercase tracking-wider text-slate-400 block mb-1">Código del Producto</label>
                    <input
                        type="text"
                        placeholder="Ej. PROD-001"
                        value={codigo}
                        onChange={e => setCodigo(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm"
                    />
                </div>
                <div>
                    <label className="text-xxs font-bold uppercase tracking-wider text-slate-400 block mb-1">Desde</label>
                    <input
                        type="date"
                        value={fechaInicio}
                        onChange={e => setFechaInicio(e.target.value)}
                        className="px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm text-slate-700"
                    />
                </div>
                <div>
                    <label className="text-xxs font-bold uppercase tracking-wider text-slate-400 block mb-1">Hasta</label>
                    <input
                        type="date"
                        value={fechaFin}
                        onChange={e => setFechaFin(e.target.value)}
                        className="px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm text-slate-700"
                    />
                </div>
                <div className="pt-5">
                    <button
                        onClick={buscar}
                        className="bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-700 hover:to-violet-750 text-white font-semibold py-2.5 px-6 rounded-xl soft-shadow transition-all duration-200 cursor-pointer text-sm"
                    >
                        Buscar Historial
                    </button>
                </div>
            </div>

            {error && <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-3 border border-rose-100 rounded-xl">{error}</p>}

            <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-3">Movimientos del Producto</h3>
                <div className="overflow-hidden border border-slate-200/40 rounded-2xl shadow-xs overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-750 border-collapse min-w-max">
                        <thead className="bg-slate-50/75 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200/40">
                            <tr>
                                <th className="p-4">Fecha y Hora</th>
                                <th className="p-4">Tipo de Movimiento</th>
                                <th className="p-4">Socio Comercial</th>
                                <th className="p-4 text-center">Cantidad</th>
                                <th className="p-4 text-right">Usuario Atendió</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {movimientos.map((m: any, i) => {
                                const isRecepcion = m.tipo === 'Recepción';
                                return (
                                    <tr key={i} className={`hover:bg-slate-50/40 transition-colors duration-150 ${isRecepcion ? 'bg-sky-50/10' : 'bg-amber-50/10'}`}>
                                        <td className="p-4 text-slate-600 font-medium">{new Date(m.fecha).toLocaleString('es-CR')}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-xs ${isRecepcion ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                {m.tipo}
                                            </span>
                                        </td>
                                        <td className="p-4 font-semibold text-slate-800">{m.cliente}</td>
                                        <td className={`p-4 text-center font-extrabold ${isRecepcion ? 'text-sky-700' : 'text-amber-700'}`}>
                                            {isRecepcion ? `+${m.cantidad}` : `-${m.cantidad}`}
                                        </td>
                                        <td className="p-4 text-right text-slate-500 font-mono text-xs">{m.usuario}</td>
                                    </tr>
                                );
                            })}
                            {movimientos.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400 font-medium bg-slate-50/10">
                                        Busque un código de producto para visualizar sus movimientos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-3">Log de Auditoría de Base de Datos (Triggers)</h3>
                <div className="overflow-hidden border border-slate-200/40 rounded-2xl shadow-xs overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-750 border-collapse min-w-max">
                        <thead className="bg-slate-50/75 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200/40">
                            <tr>
                                <th className="p-4">Fecha y Hora</th>
                                <th className="p-4 text-center">Cantidad Anterior</th>
                                <th className="p-4 text-center">Cantidad Nueva</th>
                                <th className="p-4 text-center">Efecto Logueado</th>
                                <th className="p-4 text-right">Usuario MySQL</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.map((l: any, i) => {
                                const isInc = l.efecto === 'Incremento';
                                return (
                                    <tr key={i} className={`hover:bg-slate-50/40 transition-colors duration-150 ${isInc ? 'bg-emerald-50/10' : 'bg-rose-50/10'}`}>
                                        <td className="p-4 text-slate-600 font-medium">{new Date(l.fecha).toLocaleString('es-CR')}</td>
                                        <td className="p-4 text-center font-medium text-slate-500">{l.cantidadAnterior}</td>
                                        <td className="p-4 text-center font-bold text-slate-800">{l.cantidadNueva}</td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-xs ${isInc ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                                }`}>
                                                {l.efecto}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-slate-500 font-mono text-xs">{l.usuario}</td>
                                    </tr>
                                );
                            })}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400 font-medium bg-slate-50/10">
                                        Busque un código de producto para visualizar sus logs de trigger.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}



