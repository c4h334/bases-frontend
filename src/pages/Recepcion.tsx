/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import api from '../services/api';

interface Producto {
  idProducto: number;
  codigo: string;
  nombre: string;
  detalle: string;
  cantidadActual: number;
  stockCritico: number;
  bodega: string;
  pasillo: string;
  estante: string;
}

interface Cliente {
  idCliente: number;
  nombre: string;
  rolCliente: string;
}

interface RecepcionHistorial {
  idDetalleRecepcion: number;
  idRecepcion: number;
  numeroLote: string;
  fechaRecepcion: string;
  usuarioAtendio: string;
  clienteNombre: string;
  cantidad: number;
}

export default function Recepcion() {
  const [vista, setVista] = useState<'lista' | 'formProducto' | 'formRecepcion' | 'historial'>('lista');
  
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [historial, setHistorial] = useState<RecepcionHistorial[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  const [formProducto, setFormProducto] = useState({
    codigo: '', nombre: '', detalle: '', stockCritico: 0, bodega: '', pasillo: '', estante: ''
  });

  const [formRecepcion, setFormRecepcion] = useState({
    idCliente: '', numeroLote: '', cantidad: 0
  });

  const [error, setError] = useState('');
  const [selectedProductForMap, setSelectedProductForMap] = useState<any | null>(null);

  useEffect(() => {
    if (vista === 'lista') cargarProductos();
  }, [vista]);

  const cargarProductos = async () => {
    try {
      const res = await api.get('/Productos');
      setProductos(res.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el catálogo de productos.');
    }
  };

  const cargarClientes = async () => {
    try {
      const res = await api.get('/Clientes');
      const clientesOrigen = res.data.filter((c: Cliente) => c.rolCliente === 'ORIGEN' || c.rolCliente === 'AMBOS');
      setClientes(clientesOrigen);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarHistorial = async (idProducto: number) => {
    try {
      // 1. CORRECCIÓN: La ruta del controlador en C# está en plural y minúscula
      const res = await api.get(`/Recepciones/producto/${idProducto}`);
      setHistorial(res.data);
    } catch (err) {
      console.error(err);
      setHistorial([]);
    }
  };

  // ==========================================
  // LÓGICA DE PRODUCTOS (CRUD)
  // ==========================================
  const abrirFormNuevoProducto = () => {
    setProductoSeleccionado(null);
    setFormProducto({ codigo: '', nombre: '', detalle: '', stockCritico: 0, bodega: '', pasillo: '', estante: '' });
    setError('');
    setVista('formProducto');
  };

  const abrirFormEditarProducto = (prod: Producto) => {
    setProductoSeleccionado(prod);
    setFormProducto({
      codigo: prod.codigo, nombre: prod.nombre, detalle: prod.detalle || '',
      stockCritico: prod.stockCritico, bodega: prod.bodega, pasillo: prod.pasillo, estante: prod.estante
    });
    setError('');
    setVista('formProducto');
  };

  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (productoSeleccionado) {
        await api.put(`/Productos/${productoSeleccionado.idProducto}`, { 
          idProducto: productoSeleccionado.idProducto,
          cantidadActual: productoSeleccionado.cantidadActual, 
          ...formProducto 
        });
      } else {
        await api.post('/Productos', { ...formProducto, cantidadActual: 0 });
      }
      setVista('lista');
    } catch (err) {
      console.error(err);
      setError('Error al guardar el producto.');
    }
  };

  const eliminarProducto = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este producto?')) return;
    try {
      await api.delete(`/Productos/${id}`);
      cargarProductos();
    } catch (err: any) {
      if (err.response?.status === 500 || err.response?.status === 400) {
        alert('Error de Integridad: No se puede eliminar un producto que ya tiene recepciones o despachos en el historial.');
      }
    }
  };

  // ==========================================
  // LÓGICA DE RECEPCIÓN (INGRESO DE LOTES)
  // ==========================================
  const abrirFormRecepcion = (prod: Producto) => {
    setProductoSeleccionado(prod);
    setFormRecepcion({ idCliente: '', numeroLote: '', cantidad: 1 });
    setError('');
    cargarClientes();
    setVista('formRecepcion');
  };

  const registrarRecepcion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRecepcion.idCliente || formRecepcion.cantidad <= 0) {
      setError('Complete todos los campos correctamente.');
      return;
    }
    
    try {
      // 2. CORRECCIÓN: Consumir el endpoint del Procedure con las propiedades exactas requeridas
      await api.post('/Recepciones/registrar-sp', {
        idProducto: productoSeleccionado?.idProducto,
        idCliente: parseInt(formRecepcion.idCliente),
        numeroLote: formRecepcion.numeroLote,
        cantidad: formRecepcion.cantidad, 
        usuarioAtendio: 'amonge' // Usamos un usuario real de tu BD (Anderson) en lugar de 'Sistema' para mantener la integridad en los reportes
      });
      alert('Lote recibido y stock actualizado con éxito mediante Base de Datos.');
      setVista('lista');
    } catch (err: any) {
      console.error(err);
      // Capturamos el error limpio que devuelve MySQL (ej. si la cantidad es menor a 0)
      setError(err.response?.data?.message || 'Error al registrar la recepción del lote.');
    }
  };

  const abrirHistorial = (prod: Producto) => {
    setProductoSeleccionado(prod);
    cargarHistorial(prod.idProducto);
    setVista('historial');
  };

  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl soft-shadow min-h-[80vh] flex flex-col">
      
      {/* VISTA 1: LISTADO PRINCIPAL */}
      {vista === 'lista' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-200/50 pb-5">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Catálogo de Productos</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Gestione su catálogo de inventario y registre recepciones de lotes</p>
            </div>
            <button 
              onClick={abrirFormNuevoProducto} 
              className="bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-700 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm soft-shadow transition-all duration-250 cursor-pointer text-center"
            >
              + Nuevo Producto
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="bg-slate-50/75 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200/40">
                <tr>
                  <th className="p-4">Código</th>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Ubicación</th>
                  <th className="p-4 text-center">Existencias</th>
                  <th className="p-4 text-center">Acciones de Inventario</th>
                  <th className="p-4 text-right">Mantenimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {productos.map(p => (
                  <tr key={p.idProducto} className="hover:bg-slate-50/40 transition-colors duration-150">
                    <td className="p-4 font-semibold text-slate-500 font-mono text-xs">{p.codigo}</td>
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-slate-850">{p.nombre}</div>
                      <div className="text-xs text-slate-400 truncate mt-0.5" title={p.detalle}>{p.detalle || 'Sin descripción'}</div>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => setSelectedProductForMap(p)}
                        className="text-xs font-semibold text-indigo-750 bg-indigo-50/70 hover:bg-indigo-100 hover:text-indigo-900 border border-indigo-200/40 px-2.5 py-1 rounded-lg transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-3xs hover:shadow-2xs"
                        title="Ver ubicación en mapa de estantería"
                      >
                        <svg className="w-3.5 h-3.5 text-indigo-550" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{p.bodega} &bull; P{p.pasillo} &bull; E{p.estante}</span>
                      </button>
                    </td>
                    <td className="p-4 text-center font-extrabold text-slate-800 text-base">{p.cantidadActual}</td>
                    <td className="p-4 text-center">
                      <div className="inline-flex gap-2">
                        <button 
                          onClick={() => abrirFormRecepcion(p)} 
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100/60 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
                        >
                          Recibir Lote
                        </button>
                        <button 
                          onClick={() => abrirHistorial(p)} 
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100/60 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
                        >
                          Ver Entradas
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-1">
                        <button 
                          onClick={() => abrirFormEditarProducto(p)} 
                          className="text-indigo-600 hover:text-indigo-850 hover:bg-indigo-50/60 px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => eliminarProducto(p.idProducto)} 
                          className="text-rose-600 hover:text-rose-850 hover:bg-rose-50/60 px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer"
                        >
                          Borrar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 2: FORMULARIO DE PRODUCTO */}
      {vista === 'formProducto' && (
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="border-b border-slate-200/50 pb-4">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              {productoSeleccionado ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {productoSeleccionado ? 'Nota: La cantidad en inventario solo puede ser alterada mediante transacciones de entrada/salida.' : 'Ingrese los detalles de catalogación y ubicación física del nuevo producto.'}
            </p>
          </div>

          <form onSubmit={guardarProducto} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Código del Producto</label>
              <input 
                type="text" 
                required 
                value={formProducto.codigo} 
                onChange={e => setFormProducto({...formProducto, codigo: e.target.value})} 
                className="w-full px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm" 
                placeholder="Ej. PROD-001"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Nombre Comercial</label>
              <input 
                type="text" 
                required 
                value={formProducto.nombre} 
                onChange={e => setFormProducto({...formProducto, nombre: e.target.value})} 
                className="w-full px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm" 
                placeholder="Ej. Cable UTP Cat6"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Detalle / Descripción</label>
              <textarea 
                value={formProducto.detalle} 
                onChange={e => setFormProducto({...formProducto, detalle: e.target.value})} 
                className="w-full px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm" 
                placeholder="Detalles sobre el empaque, dimensiones o especificaciones técnicas"
                rows={3}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Nombre de Bodega</label>
              <input 
                type="text" 
                required 
                value={formProducto.bodega} 
                onChange={e => setFormProducto({...formProducto, bodega: e.target.value})} 
                className="w-full px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm" 
                placeholder="Ej. Principal"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Pasillo</label>
              <input 
                type="text" 
                required 
                value={formProducto.pasillo} 
                onChange={e => setFormProducto({...formProducto, pasillo: e.target.value})} 
                className="w-full px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm" 
                placeholder="Ej. A-02"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Estante</label>
              <input 
                type="text" 
                required 
                value={formProducto.estante} 
                onChange={e => setFormProducto({...formProducto, estante: e.target.value})} 
                className="w-full px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm" 
                placeholder="Ej. Estante 3"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Stock Crítico (Nivel de Alerta)</label>
              <input 
                type="number" 
                min="0" 
                required 
                value={formProducto.stockCritico} 
                onChange={e => setFormProducto({...formProducto, stockCritico: parseInt(e.target.value)})} 
                className="w-full px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm" 
              />
            </div>

            {error && <div className="col-span-1 md:col-span-2 text-xs font-semibold text-rose-600 bg-rose-50 p-3 border border-rose-100 rounded-xl">{error}</div>}

            <div className="col-span-1 md:col-span-2 flex gap-3 pt-2">
              <button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-700 hover:to-violet-700 text-white py-2.5 rounded-xl font-semibold soft-shadow transition-all duration-200 cursor-pointer"
              >
                Guardar Producto
              </button>
              <button 
                type="button" 
                onClick={() => setVista('lista')} 
                className="bg-slate-200/70 hover:bg-slate-200 border border-slate-300/40 text-slate-700 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VISTA 3: FORMULARIO DE RECEPCIÓN */}
      {vista === 'formRecepcion' && productoSeleccionado && (
        <div className="max-w-xl mx-auto w-full space-y-6">
          <div className="border-b border-slate-200/50 pb-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-805 tracking-tight">Registrar Entrada de Lote</h2>
            <p className="text-slate-600 text-sm mt-1">
              Producto: <strong className="text-slate-800">{productoSeleccionado.codigo} &bull; {productoSeleccionado.nombre}</strong>
            </p>
            <p className="text-xs text-slate-400 mt-1 font-semibold">Stock Actual disponible: {productoSeleccionado.cantidadActual} unidades</p>
          </div>

          <form onSubmit={registrarRecepcion} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Cliente / Proveedor Origen</label>
              <select 
                required 
                value={formRecepcion.idCliente} 
                onChange={e => setFormRecepcion({...formRecepcion, idCliente: e.target.value})} 
                className="w-full px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm"
              >
                <option value="">Seleccione un proveedor/cliente...</option>
                {clientes.map(c => <option key={c.idCliente} value={c.idCliente}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Número de Lote (Rastreo)</label>
              <input 
                type="text" 
                required 
                value={formRecepcion.numeroLote} 
                onChange={e => setFormRecepcion({...formRecepcion, numeroLote: e.target.value})} 
                className="w-full px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm" 
                placeholder="Ej. LOTE-2026-X" 
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Cantidad Entrante</label>
              <input 
                type="number" 
                min="1" 
                required 
                value={formRecepcion.cantidad} 
                onChange={e => setFormRecepcion({...formRecepcion, cantidad: parseInt(e.target.value)})} 
                className="w-full px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm" 
              />
            </div>

            {error && <div className="text-xs font-semibold text-rose-600 bg-rose-50 p-3 border border-rose-100 rounded-xl">{error}</div>}

            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-750 text-white py-2.5 rounded-xl font-semibold soft-shadow transition-all duration-200 cursor-pointer"
              >
                Procesar Ingreso
              </button>
              <button 
                type="button" 
                onClick={() => setVista('lista')} 
                className="bg-slate-200/70 hover:bg-slate-200 border border-slate-300/40 text-slate-700 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VISTA 4: HISTORIAL DE RECEPCIONES */}
      {vista === 'historial' && productoSeleccionado && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-200/50 pb-5">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Historial de Ingresos de Lotes</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Producto: <span className="text-indigo-650 font-bold">{productoSeleccionado.codigo} &bull; {productoSeleccionado.nombre}</span>
              </p>
            </div>
            <button 
              onClick={() => setVista('lista')} 
              className="bg-slate-200/70 hover:bg-slate-200 border border-slate-300/40 text-slate-700 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-250 cursor-pointer text-center"
            >
              Volver al Catálogo
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="bg-slate-50/75 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200/40">
                <tr>
                  <th className="p-4">Fecha y Hora</th>
                  <th className="p-4">Lote</th>
                  <th className="p-4">Proveedor Origen</th>
                  <th className="p-4 text-center">Cantidad Recibida</th>
                  <th className="p-4 text-right">Operario Atendió</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {historial.map(h => (
                  <tr key={h.idDetalleRecepcion} className="hover:bg-emerald-50/20 transition-colors duration-150">
                    <td className="p-4 text-slate-600 font-medium">{new Date(h.fechaRecepcion).toLocaleString('es-CR')}</td>
                    <td className="p-4 font-mono text-slate-700 font-bold">{h.numeroLote}</td>
                    <td className="p-4 text-slate-700 font-medium">{h.clienteNombre}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-xs">
                        +{h.cantidad}
                      </span>
                    </td>
                    <td className="p-4 text-right text-slate-500 font-mono text-xs">{h.usuarioAtendio}</td>
                  </tr>
                ))}
                {historial.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">
                      No hay registros de ingresos o lotes recibidos para este producto.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                <div className="text-xs font-bold text-slate-505 uppercase tracking-widest">Mapa de Estantería del Almacén</div>
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