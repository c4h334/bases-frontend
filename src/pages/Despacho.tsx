/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Despacho() {
  const [vista, setVista] = useState<'lista' | 'nuevo'>('lista');
  const [despachos, setDespachos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [carrito, setCarrito] = useState<any[]>([]);
  const [idClienteSel, setIdClienteSel] = useState('');
  const [itemProd, setItemProd] = useState('');
  const [itemCant, setItemCant] = useState(1);
  const [error, setError] = useState('');
  const operario = localStorage.getItem('operario_username') || 'sistema';

  useEffect(() => {
    if (vista === 'lista') cargarDespachos();
    else cargarCatalogos();
  }, [vista]);

  const cargarDespachos = async () => {
    try { setDespachos((await api.get('/Despachos')).data); }
    catch { setError('Error al cargar despachos.'); }
  };

  const cargarCatalogos = async () => {
    try {
      const rc = await api.get('/Clientes');
      setClientes(rc.data.filter((c: any) => c.rolCliente === 'DESTINO' || c.rolCliente === 'AMBOS'));
      setProductos((await api.get('/Productos')).data);
    } catch { setError('Error al cargar catálogos.'); }
  };

  const procesarSP = async (idDespacho: number, idCliente: number) => {
    if (!window.confirm(`¿Ejecutar sp_ProcesarDespacho para despacho #${idDespacho}?`)) return;
    try {
      const res = await api.post(`/Despachos/${idDespacho}/procesar-sp`, { idCliente });
      alert(res.data.message);
      cargarDespachos();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al procesar.');
      cargarDespachos();
    }
  };

  const agregarAlCarrito = () => {
    if (!itemProd || itemCant <= 0) return;
    const prod = productos.find(p => p.idProducto.toString() === itemProd);
    if (!prod) return;
    const existe = carrito.find(c => c.idProducto.toString() === itemProd);
    if (existe) {
      setCarrito(carrito.map(c => c.idProducto.toString() === itemProd ? { ...c, cantidad: c.cantidad + itemCant } : c));
    } else {
      setCarrito([...carrito, { idProducto: prod.idProducto, nombre: prod.nombre, codigo: prod.codigo, cantidad: itemCant }]);
    }
    setItemProd(''); setItemCant(1);
  };

  const guardarOrden = async () => {
    if (!idClienteSel) { setError('Seleccione un cliente destino.'); return; }
    if (carrito.length === 0) { setError('El carrito está vacío.'); return; }
    try {
      const res = await api.post('/Despachos', {
        idCliente: parseInt(idClienteSel),
        fechaDespacho: new Date().toISOString(),
        estado: 'PENDIENTE',
        operario
      });
      const nuevoId = res.data.idDespacho;
      for (const item of carrito) {
        await api.post('/CarritosDespacho', { idDespacho: nuevoId, idProducto: item.idProducto, cantidad: item.cantidad });
      }
      alert('Orden guardada en estado PENDIENTE. Ejecute el SP desde el listado.');
      setVista('lista');
    } catch (err: any) { setError(err.response?.data?.message || 'Error al guardar orden.'); }
  };

  const s = { btn: (color = '#333') => ({ padding: '0.4rem 0.9rem', background: color, color: '#fff', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }), input: { padding: '0.4rem', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' as const } };

  return (
    <div style={{ padding: '1.5rem' }}>

      {/* VISTA 1 — Listado de despachos */}
      {vista === 'lista' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ margin: 0 }}>Módulo de Despachos</h2>
            <button style={s.btn()} onClick={() => { setCarrito([]); setIdClienteSel(''); setError(''); setVista('nuevo'); }}>+ Nueva orden</button>
          </div>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            El botón <strong>Ejecutar SP</strong> lanza <strong>sp_ProcesarDespacho</strong> con transacción ACID sobre la BD.
          </p>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <table border={1} cellPadding={5} cellSpacing={0} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead style={{ background: '#eee' }}>
              <tr><th>ID</th><th>Cliente destino</th><th>Fecha</th><th>Estado</th><th>Operario</th><th>Acción SP</th></tr>
            </thead>
            <tbody>
              {despachos.map(d => (
                <tr key={d.idDespacho} style={{ background: d.estado === 'CANCELADO' ? '#ffe0e0' : d.estado === 'PROCESADO' ? '#e0ffe0' : 'transparent' }}>
                  <td>#{d.idDespacho}</td>
                  <td>{d.cliente?.nombre || '—'}</td>
                  <td>{new Date(d.fechaDespacho).toLocaleString('es-CR')}</td>
                  <td><strong>{d.estado}</strong></td>
                  <td>{d.operario}</td>
                  <td>
                    {d.estado === 'PENDIENTE' && (
                      <button style={s.btn('#d6610a')} onClick={() => procesarSP(d.idDespacho, d.idCliente)}>
                        Ejecutar SP
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {despachos.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#999' }}>Sin despachos recientes.</td></tr>}
            </tbody>
          </table>
        </>
      )}

      {/* VISTA 2 — Nueva orden (carrito) */}
      {vista === 'nuevo' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Nueva orden de despacho</h2>
            <button style={s.btn('#888')} onClick={() => setVista('lista')}>Volver</button>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>La orden se guarda en PENDIENTE. El SP la procesa y descuenta inventario.</p>
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
            {/* Panel izquierdo */}
            <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem' }}>
                Cliente destino
                <select style={s.input} value={idClienteSel} onChange={e => setIdClienteSel(e.target.value)}>
                  <option value="">Seleccione...</option>
                  {clientes.map(c => <option key={c.idCliente} value={c.idCliente}>{c.nombre}</option>)}
                </select>
              </label>
              <label style={{ display: 'block', marginBottom: '0.75rem' }}>
                Operario
                <input style={{ ...s.input, background: '#f5f5f5' }} value={operario} readOnly />
              </label>
              <hr />
              <p style={{ marginBottom: '0.5rem' }}><strong>Agregar producto</strong></p>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Producto
                <select style={s.input} value={itemProd} onChange={e => setItemProd(e.target.value)}>
                  <option value="">Seleccione...</option>
                  {productos.map(p => <option key={p.idProducto} value={p.idProducto}>{p.codigo} — {p.nombre}</option>)}
                </select>
              </label>
              <label style={{ display: 'block', marginBottom: '0.75rem' }}>
                Cantidad
                <input style={s.input} type="number" min={1} value={itemCant} onChange={e => setItemCant(parseInt(e.target.value))} />
              </label>
              <button style={s.btn('#37a')} onClick={agregarAlCarrito}>Añadir</button>
            </div>

            {/* Panel derecho — carrito */}
            <div>
              <p><strong>Contenido de la orden</strong></p>
              <table border={1} cellPadding={5} cellSpacing={0} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead style={{ background: '#eee' }}>
                  <tr><th>Código</th><th>Producto</th><th>Cantidad</th><th>Quitar</th></tr>
                </thead>
                <tbody>
                  {carrito.map((c, i) => (
                    <tr key={i}>
                      <td>{c.codigo}</td>
                      <td>{c.nombre}</td>
                      <td style={{ textAlign: 'center' }}>{c.cantidad}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }} onClick={() => setCarrito(carrito.filter(x => x.idProducto !== c.idProducto))}>✕</button>
                      </td>
                    </tr>
                  ))}
                  {carrito.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#999' }}>Carrito vacío.</td></tr>}
                </tbody>
              </table>
              <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                <button style={s.btn('#2a7')} onClick={guardarOrden}>Guardar orden (PENDIENTE)</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
