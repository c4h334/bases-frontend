import { useState } from 'react';

export default function Auditoria() {
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  
  // Rango de fechas por defecto: Inicializa con el día de hoy y retrocede 1 mes (Exigencia de negocio)
  const hoy = new Date().toISOString().split('T')[0];
  // eslint-disable-next-line react-hooks/purity
  const haceUnMes = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [fechaInicio, setFechaInicio] = useState(haceUnMes);
  const [fechaFin, setFechaFin] = useState(hoy);

  // Datos simulados del reporte de movimientos con colores requeridos
  const [movimientos] = useState([
    { fecha: '2026-05-29 09:15', tipo: 'Despacho', cliente: 'Almacenes del Istmo', cantidad: 10, usuario: 'mulate' },
    { fecha: '2026-05-28 14:30', tipo: 'Recepción', cliente: 'TechImport S.A.', cantidad: 25, usuario: 'jmatias' }
  ]);

  // Datos simulados de la tabla bitácora de auditoría (Trigger tg_AuditoriaInventario)
  const [logsAuditoria] = useState([
    { fecha: '2026-05-29 09:15', anterior: 15, nueva: 5, accion: 'Reducción', usuario: 'mulate' },
    { fecha: '2026-05-28 14:30', anterior: 0, nueva: 25, accion: 'Incremento', usuario: 'jmatias' }
  ]);

  return (
    <div className="space-y-6">
      {/* Panel de Filtros */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Módulo de Auditoría e Inteligencia Logística</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-xs font-semibold text-gray-600 block">Código del Producto</label>
            <input type="text" value={codigoBusqueda} onChange={(e) => setCodigoBusqueda(e.target.value)} className="w-full mt-1 p-2 border rounded-lg text-sm font-mono" placeholder="PROD001" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block">Fecha Inicio</label>
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full mt-1 p-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block">Fecha Fin</label>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full mt-1 p-2 border rounded-lg text-sm" />
          </div>
          <button className="bg-slate-700 hover:bg-slate-800 text-white font-semibold py-2 rounded-lg text-sm transition-colors">
            Ejecutar Consultas Optimizadas
          </button>
        </div>
      </div>

      {/* Reporte de Movimientos */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-slate-800 mb-3">Resultado de Movimientos de Inventario (JOINs Cronológicos)</h3>
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-700 text-white font-semibold">
            <tr>
              <th className="p-3">Fecha y Hora</th>
              <th className="p-3">Tipo de Operación</th>
              <th className="p-3">Nombre Cliente</th>
              <th className="p-3 text-center">Cantidad Transada</th>
              <th className="p-3">Usuario Responsable</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {movimientos.map((m, i) => {
              const esRecepcion = m.tipo === 'Recepción';
              return (
                <tr 
                  key={i} 
                  className={esRecepcion ? 'bg-blue-100/70 text-blue-900 font-medium' : 'bg-orange-100/70 text-orange-900 font-medium'}
                >
                  <td className="p-3 font-mono">{m.fecha}</td>
                  <td className="p-3 font-bold">{m.tipo.toUpperCase()}</td>
                  <td className="p-3">{m.cliente}</td>
                  <td className="p-3 text-center font-bold">{m.cantidad}</td>
                  <td className="p-3 font-mono text-xs">{m.usuario}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Reporte de Auditoría (Log) */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-slate-800 mb-3">Histórico de Bitácora Log de Auditoría (Alimentada por Trigger MySQL)</h3>
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-700 text-white font-semibold">
            <tr>
              <th className="p-3">Fecha y Hora</th>
              <th className="p-3 text-center">Cantidad Anterior</th>
              <th className="p-3 text-center">Nueva Cantidad</th>
              <th className="p-3">Acción Registrada</th>
              <th className="p-3">Usuario de Sistema</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logsAuditoria.map((l, i) => {
              const esIncremento = l.accion === 'Incremento';
              return (
                <tr 
                  key={i} 
                  className={esIncremento ? 'bg-emerald-100/70 text-emerald-900' : 'bg-red-100/70 text-red-900'}
                >
                  <td className="p-3 font-mono">{l.fecha}</td>
                  <td className="p-3 text-center">{l.anterior}</td>
                  <td className="p-3 text-center font-bold">{l.nueva}</td>
                  <td className="p-3 font-bold">{l.accion.toUpperCase()}</td>
                  <td className="p-3 font-mono text-xs">{l.usuario}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}