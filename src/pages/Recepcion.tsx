/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Recepcion() {
  const [vista, setVista] = useState<'lista' | 'formProducto' | 'formRecepcion' | 'historial'>('lista');
  const [productos, setProductos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [historial, setHistorial] = useState<any[]>([]);
  const [productoSel, setProductoSel] = useState<any>(null);
  const [formProd, setFormProd] = useState({ codigo: '', nombre: '', detalle: '', stockCritico: 0, bodega: '', pasillo: '', estante: '' });
  const [formRec, setFormRec] = useState({ idCliente: '', numeroLote: '', cantidad: 1 });
  const [error, setError] = useState('');
  const operario = localStorage.getItem('operario_username') || 'sistema';

  useEffect(() => { if (vista === 'lista') cargarProductos(); }, [vista]);

  const cargarProductos = async () => {
    try { setProductos((await api.get('/Productos')).data); }
    catch { setError('Error al cargar productos.'); }
  };

  const cargarClientes = async () => {
    try {
      const res = await api.get('/Clientes');
      setClientes(res.data.filter((c: any) => c.rolCliente === 'ORIGEN' || c.rolCliente === 'AMBOS'));
    } catch { /* silencioso */ }
  };

  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (productoSel) {
        await api.put(`/Productos/${productoSel.idProducto}`, { idProducto: productoSel.idProducto, cantidadActual: productoSel.cantidadActual, ...formProd });
      } else {
        await api.post('/Productos', { ...formProd, cantidadActual: 0 });
      }
      setVista('lista');
    } catch { setError('Error al guardar producto.'); }
  };

  const eliminarProducto = async (id: number) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try { await api.delete(`/Productos/${id}`); cargarProductos(); }
    catch { alert('No se puede eliminar: tiene movimientos asociados.'); }
  };

  const registrarRecepcion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRec.idCliente || formRec.cantidad <= 0) { setError('Complete todos los campos.'); return; }
    try {
      // Ejecuta sp_RegistrarRecepcion (transacción ACID)
      await api.post('/Recepciones/registrar-sp', {
        idProducto: productoSel?.idProducto,
        idCliente: parseInt(formRec.idCliente),
        numeroLote: formRec.numeroLote,
        cantidad: formRec.cantidad,
        usuarioAtendio: operario
      });
      alert('Lote registrado exitosamente (sp_RegistrarRecepcion).');
      setVista('lista');
    } catch (err: any) { setError(err.response?.data?.message || 'Error al registrar recepción.'); }
  };

  const abrirHistorial = async (prod: any) => {
    setProductoSel(prod);
    try { setHistorial((await api.get(`/Recepciones/producto/${prod.idProducto}`)).data); }
    catch { setHistorial([]); }
    setVista('historial');
  };

  const s = { input: { width: '100%', padding: '0.4rem', border: '1px solid #ccc', boxSizing: 'border-box' as const, marginTop: '0.2rem' }, btn: (color = '#333') => ({ padding: '0.4rem 0.9rem', background: color, color: '#fff', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }), label: { display: 'block' as const, marginBottom: '0.75rem' } };

  return (
    <div style={{ padding: '1.5rem' }}>

      {/* VISTA 1 — Catálogo de productos */}
      {vista === 'lista' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Módulo de Recepción</h2>
            <button style={s.btn()} onClick={() => { setProductoSel(null); setFormProd({ codigo: '', nombre: '', detalle: '', stockCritico: 0, bodega: '', pasillo: '', estante: '' }); setError(''); setVista('formProducto'); }}>
              + Nuevo producto
            </button>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <table border={1} cellPadding={5} cellSpacing={0} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead style={{ background: '#eee' }}>
              <tr><th>Código</th><th>Nombre</th><th>Ubicación</th><th>Stock</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.idProducto}>
                  <td>{p.codigo}</td>
                  <td>{p.nombre}</td>
                  <td>{p.bodega} / {p.pasillo} / {p.estante}</td>
                  <td style={{ textAlign: 'center' }}>{p.cantidadActual}</td>
                  <td>
                    <button style={s.btn('#2a7')} onClick={() => { setProductoSel(p); setFormRec({ idCliente: '', numeroLote: '', cantidad: 1 }); setError(''); cargarClientes(); setVista('formRecepcion'); }}>Recibir lote</button>
                    <button style={s.btn('#37a')} onClick={() => abrirHistorial(p)}>Historial</button>
                    <button style={s.btn()} onClick={() => { setProductoSel(p); setFormProd({ codigo: p.codigo, nombre: p.nombre, detalle: p.detalle || '', stockCritico: p.stockCritico, bodega: p.bodega, pasillo: p.pasillo, estante: p.estante }); setError(''); setVista('formProducto'); }}>Editar</button>
                    <button style={s.btn('#c33')} onClick={() => eliminarProducto(p.idProducto)}>Borrar</button>
                  </td>
                </tr>
              ))}
              {productos.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999' }}>Sin productos.</td></tr>}
            </tbody>
          </table>
        </>
      )}

      {/* VISTA 2 — Formulario de producto */}
      {vista === 'formProducto' && (
        <>
          <h2>{productoSel ? 'Editar producto' : 'Nuevo producto'}</h2>
          <form onSubmit={guardarProducto} style={{ maxWidth: '480px' }}>
            <label style={s.label}>Código <input style={s.input} required value={formProd.codigo} onChange={e => setFormProd({ ...formProd, codigo: e.target.value })} /></label>
            <label style={s.label}>Nombre <input style={s.input} required value={formProd.nombre} onChange={e => setFormProd({ ...formProd, nombre: e.target.value })} /></label>
            <label style={s.label}>Detalle <input style={s.input} value={formProd.detalle} onChange={e => setFormProd({ ...formProd, detalle: e.target.value })} /></label>
            <label style={s.label}>Bodega <input style={s.input} required value={formProd.bodega} onChange={e => setFormProd({ ...formProd, bodega: e.target.value })} /></label>
            <label style={s.label}>Pasillo <input style={s.input} required value={formProd.pasillo} onChange={e => setFormProd({ ...formProd, pasillo: e.target.value })} /></label>
            <label style={s.label}>Estante <input style={s.input} required value={formProd.estante} onChange={e => setFormProd({ ...formProd, estante: e.target.value })} /></label>
            <label style={s.label}>Stock crítico <input style={s.input} type="number" min={0} required value={formProd.stockCritico} onChange={e => setFormProd({ ...formProd, stockCritico: parseInt(e.target.value) })} /></label>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit" style={s.btn()}>Guardar</button>
            <button type="button" style={s.btn('#888')} onClick={() => setVista('lista')}>Cancelar</button>
          </form>
        </>
      )}

      {/* VISTA 3 — Formulario de recepción (sp_RegistrarRecepcion) */}
      {vista === 'formRecepcion' && productoSel && (
        <>
          <h2>Registrar ingreso de lote</h2>
          <p>Producto: <strong>{productoSel.codigo} — {productoSel.nombre}</strong> (stock actual: {productoSel.cantidadActual})</p>
          <p style={{ background: '#e8f0fe', border: '1px solid #aac', padding: '0.5rem', fontSize: '0.85rem' }}>
            Ejecuta <strong>sp_RegistrarRecepcion</strong> con transacción ACID. El trigger <strong>tg_AuditoriaInventario</strong> registra el cambio automáticamente.
          </p>
          <form onSubmit={registrarRecepcion} style={{ maxWidth: '400px', marginTop: '1rem' }}>
            <label style={s.label}>
              Cliente origen
              <select style={s.input} required value={formRec.idCliente} onChange={e => setFormRec({ ...formRec, idCliente: e.target.value })}>
                <option value="">Seleccione...</option>
                {clientes.map(c => <option key={c.idCliente} value={c.idCliente}>{c.nombre}</option>)}
              </select>
            </label>
            <label style={s.label}>Número de lote <input style={s.input} required value={formRec.numeroLote} onChange={e => setFormRec({ ...formRec, numeroLote: e.target.value })} placeholder="Ej: LOTE-2026-001" /></label>
            <label style={s.label}>Cantidad <input style={s.input} type="number" min={1} required value={formRec.cantidad} onChange={e => setFormRec({ ...formRec, cantidad: parseInt(e.target.value) })} /></label>
            <label style={s.label}>Operario <input style={{ ...s.input, background: '#f5f5f5' }} value={operario} readOnly /></label>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit" style={s.btn('#2a7')}>Confirmar ingreso</button>
            <button type="button" style={s.btn('#888')} onClick={() => setVista('lista')}>Cancelar</button>
          </form>
        </>
      )}

      {/* VISTA 4 — Historial de recepciones */}
      {vista === 'historial' && productoSel && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Historial — {productoSel.nombre}</h2>
            <button style={s.btn('#888')} onClick={() => setVista('lista')}>Volver</button>
          </div>
          <table border={1} cellPadding={5} cellSpacing={0} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead style={{ background: '#eee' }}>
              <tr><th>Fecha</th><th>Lote</th><th>Proveedor</th><th>Cantidad</th><th>Operario</th></tr>
            </thead>
            <tbody>
              {historial.map((h, i) => (
                <tr key={i}>
                  <td>{new Date(h.fechaRecepcion).toLocaleString('es-CR')}</td>
                  <td>{h.numeroLote}</td>
                  <td>{h.clienteNombre}</td>
                  <td style={{ textAlign: 'center', color: 'green' }}>+{h.cantidad}</td>
                  <td>{h.usuarioAtendio}</td>
                </tr>
              ))}
              {historial.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999' }}>Sin registros.</td></tr>}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
