import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Monitoreo() {
  const [productos, setProductos] = useState([]);
  const [alertas, setAlertas] = useState<Record<number, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/Productos/monitoreo')
      .then(res => {
        setProductos(res.data);
        res.data.forEach((p: any) => {
          // Llama a fn_VerificarAlertaStock por cada producto
          api.get(`/Productos/${p.idProducto}/alerta-stock`)
            .then(r => setAlertas(prev => ({ ...prev, [p.idProducto]: r.data.estado })));
        });
      })
      .catch(() => setError('Error al cargar inventario.'));
  }, []);

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2>Monitoreo de Inventario</h2>
      <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Estado actual del inventario. Las alertas de stock son calculadas por <code>fn_VerificarAlertaStock</code>.
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border={1} cellPadding={6} cellSpacing={0} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead style={{ background: '#eee' }}>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Ubicación</th>
            <th>Stock actual</th>
            <th>Último ingreso</th>
            <th>Último despacho</th>
            <th>Alerta</th>
          </tr>
        </thead>
        <tbody>
          {(productos as any[]).map(p => {
            const enReorden = alertas[p.idProducto] === 'REORDEN';
            return (
              <tr key={p.idProducto} style={{ background: enReorden ? '#ffe0e0' : 'transparent' }}>
                <td>{p.codigo}</td>
                <td>{p.nombre}</td>
                <td>{p.bodega} / {p.pasillo} / {p.estante}</td>
                <td style={{ textAlign: 'center' }}><strong>{p.cantidadActual}</strong></td>
                <td>{p.ultimoIngreso ? new Date(p.ultimoIngreso).toLocaleString('es-CR') : '—'}</td>
                <td>{p.ultimoDespacho ? new Date(p.ultimoDespacho).toLocaleString('es-CR') : '—'}</td>
                <td style={{ color: enReorden ? 'red' : 'green', fontWeight: 'bold' }}>
                  {enReorden ? 'REORDEN' : 'OK'}
                </td>
              </tr>
            );
          })}
          {productos.length === 0 && (
            <tr><td colSpan={7} style={{ textAlign: 'center', color: '#999' }}>Sin productos registrados.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
