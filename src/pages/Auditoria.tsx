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
            // CORRECCIÓN: Utilizamos la instancia 'api' para apuntar al backend C#
            const resMov = await api.get(`/AuditoriaProductos/movimientos${query}`);
            setMovimientos(resMov.data);
            
            const resLog = await api.get(`/AuditoriaProductos/log-auditoria${query}`);
            setLogs(resLog.data);
        } catch (e: any) {
            setError(e.response?.data?.message || 'Error de conexión al servidor.');
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Auditoría y Trazabilidad</h2>
            
            <div className="flex flex-wrap gap-4 mb-8 bg-gray-50 p-4 rounded-lg border">
                <input type="text" placeholder="Código de Producto" value={codigo} onChange={e => setCodigo(e.target.value)} className="border p-2 rounded w-64" />
                <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="border p-2 rounded" />
                <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="border p-2 rounded" />
                <button onClick={buscar} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded">Buscar Historial</button>
            </div>
            
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <h3 className="text-xl font-semibold mb-4">Movimientos del Producto</h3>
            <div className="overflow-x-auto shadow-md sm:rounded-lg mb-8">
                <table className="w-full text-sm text-left text-gray-700 border">
                    <thead className="text-xs uppercase bg-gray-800 text-white">
                        <tr><th className="px-6 py-3">Fecha</th><th className="px-6 py-3">Tipo</th><th className="px-6 py-3">Cliente</th><th className="px-6 py-3">Cantidad</th><th className="px-6 py-3">Usuario</th></tr>
                    </thead>
                    <tbody>
                        {movimientos.map((m: any, i) => (
                            <tr key={i} className="border-b" style={{ backgroundColor: m.tipo === 'Recepción' ? '#dbeafe' : '#ffedd5' }}>
                                <td className="px-6 py-4">{new Date(m.fecha).toLocaleString()}</td><td className="px-6 py-4 font-bold">{m.tipo}</td><td className="px-6 py-4">{m.cliente}</td><td className="px-6 py-4">{m.cantidad}</td><td className="px-6 py-4">{m.usuario}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h3 className="text-xl font-semibold mb-4">Log de Auditoría (Trigger)</h3>
            <div className="overflow-x-auto shadow-md sm:rounded-lg mb-8">
                <table className="w-full text-sm text-left text-gray-700 border">
                    <thead className="text-xs uppercase bg-gray-800 text-white">
                        <tr><th className="px-6 py-3">Fecha</th><th className="px-6 py-3">Cant. Anterior</th><th className="px-6 py-3">Cant. Nueva</th><th className="px-6 py-3">Efecto</th><th className="px-6 py-3">Usuario</th></tr>
                    </thead>
                    <tbody>
                        {logs.map((l: any, i) => (
                            <tr key={i} className="border-b" style={{ backgroundColor: l.efecto === 'Incremento' ? '#dcfce7' : '#fee2e2' }}>
                                <td className="px-6 py-4">{new Date(l.fecha).toLocaleString()}</td><td className="px-6 py-4">{l.cantidadAnterior}</td><td className="px-6 py-4">{l.cantidadNueva}</td><td className="px-6 py-4 font-bold">{l.efecto}</td><td className="px-6 py-4">{l.usuario}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
