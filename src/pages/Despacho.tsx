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
    <div className="bg-white p-6 rounded-xl shadow-md min-h-[80vh]">
      
      {vista === 'lista' && (
        <>
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Módulo de Distribución (Despachos)</h2>
              <p className="text-sm text-gray-500">Historial de la última semana y ejecución transaccional</p>
            </div>
            <button onClick={abrirNuevoDespacho} className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 font-medium">
              + Nueva Orden de Despacho
            </button>
          </div>

          {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded text-sm">{error}</div>}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 text-sm font-semibold">
                <tr>
                  <th className="p-3">ID Despacho</th>
                  <th className="p-3">Cliente Destino</th>
                  <th className="p-3">Fecha de Orden</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Operario</th>
                  <th className="p-3 text-center">Acción Transaccional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {despachos.map((d: any) => (
                  <tr key={d.idDespacho} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">#{d.idDespacho}</td>
                    <td className="p-3">{d.cliente?.nombre || 'N/A'}</td>
                    <td className="p-3">{new Date(d.fechaDespacho).toLocaleString('es-CR')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${d.estado === 'PROCESADO' ? 'bg-green-100 text-green-800' : d.estado === 'CANCELADO' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {d.estado}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{d.operario}</td>
                    <td className="p-3 text-center">
                      {d.estado === 'PENDIENTE' && (
                        <button 
                          onClick={() => procesarDespachoSP(d.idDespacho, d.idCliente)} 
                          className="bg-orange-500 text-white px-4 py-1 rounded hover:bg-orange-600 font-medium"
                        >
                          Ejecutar SP (Procesar)
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {despachos.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-500">No hay despachos recientes.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {vista === 'nuevo' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="border-b pb-4 mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Crear Orden de Despacho (Carrito)</h2>
              <p className="text-sm text-gray-500">Agregue los productos a despachar. La orden quedará PENDIENTE hasta ejecutar el SP.</p>
            </div>
            <button onClick={() => setVista('lista')} className="text-slate-500 hover:text-slate-800 underline">
              Volver al historial
            </button>
          </div>

          {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded text-sm">{error}</div>}

          <div className="grid grid-cols-3 gap-6">
            {/* Formulario de Cabecera y Agregar Items */}
            <div className="col-span-1 space-y-4 bg-slate-50 p-4 rounded border">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cliente Destino</label>
                <select value={idClienteSel} onChange={e => setIdClienteSel(e.target.value)} className="w-full mt-1 border rounded p-2 text-sm">
                  <option value="">Seleccione...</option>
                  {clientes.map((c: any) => <option key={c.idCliente} value={c.idCliente}>{c.nombre}</option>)}
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200 mt-4">
                <h3 className="font-semibold text-slate-700 mb-2">Agregar al Carrito</h3>
                <label className="block text-sm font-medium text-gray-700">Producto</label>
                <select value={itemProd} onChange={e => setItemProd(e.target.value)} className="w-full mt-1 border rounded p-2 text-sm mb-3">
                  <option value="">Seleccione producto...</option>
                  {productos.map((p: any) => <option key={p.idProducto} value={p.idProducto}>{p.codigo} - {p.nombre}</option>)}
                </select>

                <label className="block text-sm font-medium text-gray-700">Cantidad a Despachar</label>
                <input type="number" min="1" value={itemCant} onChange={e => setItemCant(parseInt(e.target.value))} className="w-full mt-1 border rounded p-2 text-sm mb-3" />

                <button onClick={agregarAlCarrito} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium text-sm">
                  Añadir al carrito
                </button>
              </div>
            </div>

            {/* Vista del Carrito */}
            <div className="col-span-2">
              <h3 className="font-semibold text-slate-700 mb-2">Contenido de la Orden</h3>
              <div className="bg-white border rounded shadow-sm min-h-[250px]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-2 border-b">Código</th>
                      <th className="p-2 border-b">Producto</th>
                      <th className="p-2 border-b text-center">Cant. Solicitada</th>
                      <th className="p-2 border-b text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map((c, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-2">{c.codigo}</td>
                        <td className="p-2 font-medium">{c.nombre}</td>
                        <td className="p-2 text-center font-bold text-slate-800">{c.cantidad}</td>
                        <td className="p-2 text-center">
                          <button onClick={() => quitarDelCarrito(c.idProducto)} className="text-red-500 hover:text-red-700 font-bold text-xs">Quitar</button>
                        </td>
                      </tr>
                    ))}
                    {carrito.length === 0 && (
                      <tr><td colSpan={4} className="p-6 text-center text-gray-400">El carrito está vacío.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end">
                <button onClick={guardarOrdenCompleta} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-bold">
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
