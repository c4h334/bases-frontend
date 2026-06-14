/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import api from '../services/api';

export default function Auditoria() {
  const [codigo, setCodigo] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState('');

  const buscar = async () => {
    setError('');
    if (!codigo.trim()) { setError('Ingrese un código de producto.'); return; }
    const query = `?codigo=${codigo}${fechaInicio ? `&fechaInicio=${fechaInicio}` : ''}${fechaFin ? `&fechaFin=${fechaFin}` : ''}`;
    try {
      setMovimientos((await api.get(`/AuditoriaProductos/movimientos${query}`)).data);
      // Consulta el log generado por tg_AuditoriaInventario
      setLogs((await api.get(`/AuditoriaProductos/log-auditoria${query}`)).data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al buscar.');
      setMovimientos([]); setLogs([]);
    }
  };

  const s = { input: { padding: '0.4rem', border: '1px solid #ccc' }, btn: { padding: '0.4rem 1rem', background: '#333', color: '#fff', border: 'none', cursor: 'pointer' } };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2>Auditoría y Trazabilidad</h2>
      <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
        Los registros de "Log de auditoría" son generados automáticamente por el trigger <strong>tg_AuditoriaInventario</strong>.
      </p>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <label>
          Código de producto
          <br />
          <input style={s.input} value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Ej: PROD-001" />
        </label>
        <label>
          Fecha inicio
          <br />
          <input style={s.input} type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
        </label>
        <label>
          Fecha fin
          <br />
          <input style={s.input} type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
        </label>
        <button style={s.btn} onClick={buscar}>Buscar</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Movimientos */}
      <h3>Movimientos del producto</h3>
      <table border={1} cellPadding={5} cellSpacing={0} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        <thead style={{ background: '#eee' }}>
          <tr><th>Fecha</th><th>Tipo</th><th>Cliente</th><th>Cantidad</th><th>Usuario</th></tr>
        </thead>
        <tbody>
          {movimientos.map((m, i) => (
            <tr key={i} style={{ background: m.tipo === 'Recepción' ? '#dbeafe' : '#ffedd5' }}>
              <td>{new Date(m.fecha).toLocaleString('es-CR')}</td>
              <td><strong>{m.tipo}</strong></td>
              <td>{m.cliente}</td>
              <td>{m.cantidad}</td>
              <td>{m.usuario}</td>
            </tr>
          ))}
          {movimientos.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999' }}>Sin resultados.</td></tr>}
        </tbody>
      </table>

      {/* Log del trigger */}
      <h3>Log de auditoría — trigger <code>tg_AuditoriaInventario</code></h3>
      <table border={1} cellPadding={5} cellSpacing={0} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead style={{ background: '#eee' }}>
          <tr><th>Fecha</th><th>Cant. anterior</th><th>Cant. nueva</th><th>Efecto</th><th>Usuario</th></tr>
        </thead>
        <tbody>
          {logs.map((l, i) => (
            <tr key={i} style={{ background: l.efecto === 'Incremento' ? '#dcfce7' : '#fee2e2' }}>
              <td>{new Date(l.fecha).toLocaleString('es-CR')}</td>
              <td style={{ textAlign: 'center' }}>{l.cantidadAnterior}</td>
              <td style={{ textAlign: 'center' }}>{l.cantidadNueva}</td>
              <td><strong>{l.efecto}</strong></td>
              <td>{l.usuario}</td>
            </tr>
          ))}
          {logs.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999' }}>Sin registros del trigger.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
