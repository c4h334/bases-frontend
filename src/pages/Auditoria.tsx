/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import api from '../services/api';

interface Movimiento {
  idMovimiento: number;
  fecha: string;
  tipoMovimiento: 'Recepción' | 'Despacho';
  cliente: string;
  cantidad: number;
  usuario: string;
}

interface LogAuditoria {
  idAuditoria: number;
  fechaMovimiento: string;
  cantidadAnterior: number;
  cantidadNueva: number;
  usuarioModificacion: string;
}

export default function Auditoria() {
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Configuración estricta de la rúbrica: Fin = Hoy, Inicio = Hace un mes
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(hoy.getMonth() - 1);
    
    setFechaFin(hoy.toISOString().split('T')[0]);
    setFechaInicio(haceUnMes.toISOString().split('T')[0]);
  }, []);

  const ejecutarBusqueda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoBusqueda.trim()) {
      setError('Debe ingresar un código de producto para buscar.');
      return;
    }
    setError('');

    try {
      // El backend debe encargar de unir Recepciones y Despachos en la ruta /Movimientos
      const resMovimientos = await api.get(`/Auditoria/Movimientos?codigo=${codigoBusqueda}&inicio=${fechaInicio}&fin=${fechaFin}`);
      setMovimientos(resMovimientos.data);

      // El backend jala directo de la tabla AUDITORIA_PRODUCTO
      const resLogs = await api.get(`/Auditoria/Logs?codigo=${codigoBusqueda}&inicio=${fechaInicio}&fin=${fechaFin}`);
      setLogs(resLogs.data);

      setBusquedaRealizada(true);
    } catch (err) {
      console.error(err);
      setError('Error al consultar los registros. Verifique el código del producto.');
      setBusquedaRealizada(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Búsqueda Avanzada de Trazabilidad</h2>
        <p className="text-sm text-gray-500 mb-4">Ingrese el código exacto del producto y el rango de fechas para inspeccionar el historial completo.</p>
        
        <form onSubmit={ejecutarBusqueda} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Código de Producto</label>
            <input type="text" value={codigoBusqueda} onChange={e => setCodigoBusqueda(e.target.value.toUpperCase())} className="w-full mt-1 border-2 border-slate-200 rounded p-2 uppercase" placeholder="Ej. PRD-100" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Fecha Inicio (Por Defecto 1 Mes)</label>
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="w-full mt-1 border border-slate-200 rounded p-2" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Fecha Fin (Hoy)</label>
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="w-full mt-1 border border-slate-200 rounded p-2" />
          </div>
          <button type="submit" className="bg-blue-800 text-white px-8 py-2 rounded-lg hover:bg-blue-900 font-bold border-2 border-blue-800 transition-colors">
            Auditar
          </button>
        </form>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </div>

      {busquedaRealizada && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          <div className="bg-white p-6 rounded-xl shadow-md overflow-hidden">
            <h3 className="font-bold text-slate-800 border-b pb-2 mb-4">1. Flujo de Transacciones (Operaciones)</h3>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 text-xs uppercase sticky top-0">
                  <tr>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Socio Comercial</th>
                    <th className="p-3 text-center">Cant.</th>
                    <th className="p-3">Usuario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white text-sm">
                  {movimientos.map(m => (
                    // La rúbrica exige azulado para recepciones y naranja para despachos
                    <tr key={m.idMovimiento} className={m.tipoMovimiento === 'Recepción' ? 'bg-blue-50 text-blue-900' : 'bg-orange-50 text-orange-900'}>
                      <td className="p-3 whitespace-nowrap">{new Date(m.fecha).toLocaleString('es-CR')}</td>
                      <td className="p-3 font-bold">{m.tipoMovimiento}</td>
                      <td className="p-3 font-medium">{m.cliente}</td>
                      <td className="p-3 text-center font-black">{m.cantidad}</td>
                      <td className="p-3 text-xs">{m.usuario}</td>
                    </tr>
                  ))}
                  {movimientos.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500 bg-gray-50">Sin operaciones en este periodo.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md overflow-hidden border-l-4 border-slate-400">
            <h3 className="font-bold text-slate-800 border-b pb-2 mb-4">2. Log de Auditoría Física (Trigger BBDD)</h3>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 text-xs uppercase sticky top-0">
                  <tr>
                    <th className="p-3">Marca de Tiempo</th>
                    <th className="p-3 text-center">Stock Ant.</th>
                    <th className="p-3 text-center">Stock Nvo.</th>
                    <th className="p-3 text-center">Variación</th>
                    <th className="p-3">Culpable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white text-sm">
                  {logs.map(log => {
                    const incremento = log.cantidadNueva > log.cantidadAnterior;
                    const diferencia = Math.abs(log.cantidadNueva - log.cantidadAnterior);
                    return (
                      // La rúbrica exige verdoso para incrementos y rojizo para reducciones
                      <tr key={log.idAuditoria} className={incremento ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}>
                        <td className="p-3 whitespace-nowrap">{new Date(log.fechaMovimiento).toLocaleString('es-CR')}</td>
                        <td className="p-3 text-center font-medium">{log.cantidadAnterior}</td>
                        <td className="p-3 text-center font-medium">{log.cantidadNueva}</td>
                        <td className="p-3 text-center font-black">
                          {incremento ? `+${diferencia}` : `-${diferencia}`}
                        </td>
                        <td className="p-3 text-xs">{log.usuarioModificacion}</td>
                      </tr>
                    );
                  })}
                  {logs.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500 bg-gray-50">El trigger no capturó variaciones físicas.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}