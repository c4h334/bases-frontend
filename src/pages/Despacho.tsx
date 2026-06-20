/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Despacho() {
  const [vista, setVista] = useState<'lista' | 'nuevo'>('lista');
  const [despachos, setDespachos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState('');

  // Estados para el formulario de nuevo despacho
  const [idClienteSel, setIdClienteSel] = useState('');
  const [carrito, setCarrito] = useState<any[]>([]);
  const [itemProd, setItemProd] = useState('');
  const [itemCant, setItemCant] = useState(1);

  useEffect(() => {
    if (vista === 'lista') {
      cargarDespachos();
    } else {
      cargarCatalogos();
    }
  }, [vista]);

  const cargarDespachos = async () => {
    try {
      const res = await api.get('/Despachos');
      setDespachos(res.data);
    } catch (err) {
      setError('Error al cargar los despachos.');
    }
  };

  const cargarCatalogos = async () => {
    try {
      const resC = await api.get('/Clientes');
      // Filtrar solo los clientes que pueden recibir mercancía
      setClientes(resC.data.filter((c: any) => c.rolCliente === 'DESTINO' || c.rolCliente === 'AMBOS'));
      
      const resP = await api.get('/Productos');
      setProductos(resP.data);
    } catch (err) {
      setError('Error al cargar catálogos.');
    }
  };

  const procesarDespachoSP = async (idDespacho: number, idCliente: number) => {
    if (!window.confirm('¿Está seguro de procesar este despacho? El SP evaluará el stock inmediatamente.')) return;
    
    try {
      const res = await api.post(`/Despachos/${idDespacho}/procesar-sp`, { idCliente });
      alert(res.data.message || 'Despacho procesado exitosamente por la Base de Datos.');
      cargarDespachos();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error de integridad al procesar el despacho.');
      // Recargar para ver si el SP lo pasó a CANCELADO
      cargarDespachos();
    }
  };

  // --- LÓGICA DE CREACIÓN DE DESPACHO ---
  const abrirNuevoDespacho = () => {
    setIdClienteSel('');
    setCarrito([]);
    setItemProd('');
    setItemCant(1);
    setError('');
    setVista('nuevo');
  };

  const agregarAlCarrito = () => {
    if (!itemProd || itemCant <= 0) return;
    const productoInfo: any = productos.find((p: any) => p.idProducto.toString() === itemProd);
    if (!productoInfo) return;

    // Verificar si ya está en el carrito para sumar o agregar nuevo
    const existe = carrito.find(c => c.idProducto.toString() === itemProd);
    if (existe) {
      setCarrito(carrito.map(c => c.idProducto.toString() === itemProd ? { ...c, cantidad: c.cantidad + itemCant } : c));
    } else {
      setCarrito([...carrito, { idProducto: productoInfo.idProducto, nombre: productoInfo.nombre, codigo: productoInfo.codigo, cantidad: itemCant }]);
    }
    
    setItemProd('');
    setItemCant(1);
  };

  const quitarDelCarrito = (idProd: number) => {
    setCarrito(carrito.filter(c => c.idProducto !== idProd));
  };

  const guardarOrdenCompleta = async () => {
    if (!idClienteSel) return setError('Debe seleccionar un cliente destino.');
    if (carrito.length === 0) return setError('El carrito no puede estar vacío.');

    try {
      // 1. Crear el encabezado del Despacho (Queda PENDIENTE por defecto)
      const resDespacho = await api.post('/Despachos', {
        idCliente: parseInt(idClienteSel),
        fechaDespacho: new Date().toISOString(),
        estado: 'PENDIENTE',
        operario: 'amonge' // Usuario de tu BD
      });

      const nuevoIdDespacho = resDespacho.data.idDespacho;

      // 2. Insertar los productos en la tabla CARRITO_DESPACHO
      for (const item of carrito) {
        await api.post('/CarritosDespacho', {
          idDespacho: nuevoIdDespacho,
          idProducto: item.idProducto,
          cantidad: item.cantidad
        });
      }

      alert('Orden PENDIENTE creada. Ahora puede ejecutar el Stored Procedure para procesarla.');
      setVista('lista');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar la orden.');
    }
  };

  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl soft-shadow min-h-[80vh] flex flex-col">
      
      {vista === 'lista' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-200/50 pb-5">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Distribución (Despachos)</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Historial de despachos y ejecución transaccional por Base de Datos</p>
            </div>
            <button 
              onClick={abrirNuevoDespacho} 
              className="bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-700 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm soft-shadow transition-all duration-250 cursor-pointer text-center"
            >
              + Nueva Orden de Despacho
            </button>
          </div>

          {error && <div className="text-xs font-semibold text-rose-600 bg-rose-50 p-3 border border-rose-100 rounded-xl">{error}</div>}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="bg-slate-50/75 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200/40">
                <tr>
                  <th className="p-4">ID Despacho</th>
                  <th className="p-4">Cliente Destino</th>
                  <th className="p-4">Fecha de Orden</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Operario</th>
                  <th className="p-4 text-center">Acción Transaccional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {despachos.map((d: any) => (
                  <tr key={d.idDespacho} className="hover:bg-slate-50/40 transition-colors duration-150">
                    <td className="p-4 font-mono font-bold text-slate-400">#{d.idDespacho}</td>
                    <td className="p-4 font-semibold text-slate-800">{d.cliente?.nombre || 'N/A'}</td>
                    <td className="p-4 text-slate-650">{new Date(d.fechaDespacho).toLocaleString('es-CR')}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-xs ${
                        d.estado === 'PROCESADO' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : d.estado === 'CANCELADO' 
                            ? 'bg-rose-50 text-rose-700 border-rose-100' 
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {d.estado}
                      </span>
                    </td>
                    <td className="p-4 text-slate-550 font-mono text-xs">{d.operario}</td>
                    <td className="p-4 text-center">
                      {d.estado === 'PENDIENTE' && (
                        <button 
                          onClick={() => procesarDespachoSP(d.idDespacho, d.idCliente)} 
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/50 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all duration-150 cursor-pointer"
                        >
                          Ejecutar SP (Procesar)
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {despachos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400 font-medium">
                      No hay despachos recientes en el historial.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {vista === 'nuevo' && (
        <div className="w-full space-y-6">
          <div className="border-b border-slate-200/50 pb-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Crear Orden de Despacho (Carrito)</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Agregue los productos a despachar. La orden quedará PENDIENTE hasta ejecutar el SP.</p>
            </div>
            <button 
              onClick={() => setVista('lista')} 
              className="bg-slate-200/70 hover:bg-slate-200 border border-slate-300/40 text-slate-700 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-250 cursor-pointer text-center"
            >
              Volver al Historial
            </button>
          </div>

          {error && <div className="text-xs font-semibold text-rose-600 bg-rose-50 p-3 border border-rose-100 rounded-xl">{error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario de Cabecera y Agregar Items */}
            <div className="lg:col-span-1 space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-200/40">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Cliente Destino</label>
                <select 
                  value={idClienteSel} 
                  onChange={e => setIdClienteSel(e.target.value)} 
                  className="w-full px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm"
                >
                  <option value="">Seleccione...</option>
                  {clientes.map((c: any) => <option key={c.idCliente} value={c.idCliente}>{c.nombre}</option>)}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200/60 mt-4 space-y-4">
                <h3 className="font-bold text-slate-700 text-sm">Agregar Producto</h3>
                
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Producto</label>
                  <select 
                    value={itemProd} 
                    onChange={e => setItemProd(e.target.value)} 
                    className="w-full px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm"
                  >
                    <option value="">Seleccione producto...</option>
                    {productos.map((p: any) => <option key={p.idProducto} value={p.idProducto}>{p.codigo} - {p.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Cantidad a Despachar</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={itemCant} 
                    onChange={e => setItemCant(parseInt(e.target.value))} 
                    className="w-full px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm" 
                  />
                </div>

                <button 
                  onClick={agregarAlCarrito} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer"
                >
                  Añadir al carrito
                </button>
              </div>
            </div>

            {/* Vista del Carrito */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-700 text-sm">Contenido de la Orden</h3>
              <div className="bg-white/50 border border-slate-200/50 rounded-2xl shadow-xs overflow-hidden min-h-[250px]">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50/75 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200/40">
                    <tr>
                      <th className="p-3">Código</th>
                      <th className="p-3">Producto</th>
                      <th className="p-3 text-center">Cant. Solicitada</th>
                      <th className="p-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {carrito.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-55/40 transition-colors duration-150">
                        <td className="p-3 font-semibold text-slate-500 font-mono text-xs">{c.codigo}</td>
                        <td className="p-3 font-semibold text-slate-850">{c.nombre}</td>
                        <td className="p-3 text-center font-extrabold text-slate-800 text-base">{c.cantidad}</td>
                        <td className="p-3 text-center">
                          <button 
                            onClick={() => quitarDelCarrito(c.idProducto)} 
                            className="text-rose-600 hover:text-rose-850 hover:bg-rose-50 px-2 py-1 rounded-lg font-bold text-xs transition-all duration-150 cursor-pointer"
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {carrito.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-slate-400 font-medium">
                          El carrito está vacío. Agrega productos desde el panel lateral.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={guardarOrdenCompleta} 
                  className="bg-gradient-to-r from-emerald-600 to-teal-650 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm soft-shadow transition-all duration-200 cursor-pointer"
                >
                  Guardar Orden (PENDIENTE)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
