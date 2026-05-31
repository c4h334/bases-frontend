/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import api from '../services/api';

interface Cliente {
  idCliente: number;
  nombre: string;
  rolCliente: string;
}

interface Producto {
  idProducto: number;
  codigo: string;
  nombre: string;
  cantidadActual: number;
}

interface CarritoItem {
  producto: Producto;
  cantidad: number;
}

interface Despacho {
  idDespacho: number;
  clienteNombre: string;
  fechaDespacho: string;
  estado: 'PENDIENTE' | 'PROCESADO' | 'CANCELADO';
  operario: string;
}

interface DetalleDespacho {
  productoNombre: string;
  cantidad: number;
}

export default function Despachos() {
  const [vista, setVista] = useState<'lista' | 'crear' | 'detalle'>('lista');
  
  const [despachos, setDespachos] = useState<Despacho[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadInput, setCantidadInput] = useState(1);
  
  const [despachoViendo, setDespachoViendo] = useState<Despacho | null>(null);
  const [detallesViendo, setDetallesViendo] = useState<DetalleDespacho[]>([]);
  
  const [error, setError] = useState('');

  useEffect(() => {
    if (vista === 'lista') {
      const hoy = new Date();
      const haceUnaSemana = new Date();
      haceUnaSemana.setDate(hoy.getDate() - 7);
      
      const fin = hoy.toISOString().split('T')[0];
      const inicio = haceUnaSemana.toISOString().split('T')[0];
      
      setFechaInicio(inicio);
      setFechaFin(fin);
      cargarDespachos(inicio, fin);
    }
  }, [vista]);

  const cargarDespachos = async (inicio: string, fin: string) => {
    try {
      const res = await api.get(`/Despachos?inicio=${inicio}&fin=${fin}`);
      setDespachos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarFormularioCreacion = async () => {
    try {
      const resClientes = await api.get('/Clientes');
      setClientes(resClientes.data.filter((c: Cliente) => c.rolCliente === 'DESTINO' || c.rolCliente === 'AMBOS'));
      
      const resProductos = await api.get('/Productos');
      setProductosDisponibles(resProductos.data.filter((p: Producto) => p.cantidadActual > 0));
      
      setCarrito([]);
      setClienteSeleccionado('');
      setError('');
      setVista('crear');
    } catch (err) {
      console.error(err);
    }
  };

  const agregarAlCarrito = () => {
    if (!productoSeleccionado || cantidadInput <= 0) return;
    
    const prod = productosDisponibles.find(p => p.idProducto.toString() === productoSeleccionado);
    if (!prod) return;

    if (cantidadInput > prod.cantidadActual) {
      setError(`Stock insuficiente. Solo hay ${prod.cantidadActual} unidades de ${prod.nombre}.`);
      return;
    }

    const existe = carrito.find(item => item.producto.idProducto === prod.idProducto);
    if (existe) {
      const nuevaCantidad = existe.cantidad + cantidadInput;
      if (nuevaCantidad > prod.cantidadActual) {
        setError(`La cantidad total en el carrito supera el stock físico de ${prod.cantidadActual}.`);
        return;
      }
      setCarrito(carrito.map(item => item.producto.idProducto === prod.idProducto ? { ...item, cantidad: nuevaCantidad } : item));
    } else {
      setCarrito([...carrito, { producto: prod, cantidad: cantidadInput }]);
    }
    setError('');
    setCantidadInput(1);
  };

  const quitarDelCarrito = (idProducto: number) => {
    setCarrito(carrito.filter(item => item.producto.idProducto !== idProducto));
  };

  const procesarDespacho = async () => {
    if (!clienteSeleccionado || carrito.length === 0) {
      setError('Seleccione un cliente y agregue al menos un producto al carrito.');
      return;
    }

    try {
      await api.post('/Despachos/Procesar', {
        idCliente: parseInt(clienteSeleccionado),
        productos: carrito.map(item => ({
          idProducto: item.producto.idProducto,
          cantidad: item.cantidad
        })),
        operario: 'Sistema'
      });
      alert('Despacho procesado exitosamente.');
      setVista('lista');
    } catch (err: any) {
      alert('La orden fue cancelada automáticamente. Uno o más productos sufrieron quiebre de stock durante el proceso (ACID Rollback).');
      setVista('lista');
    }
  };

  const verDetalles = async (despacho: Despacho) => {
    try {
      const res = await api.get(`/Despachos/${despacho.idDespacho}/Detalles`);
      setDetallesViendo(res.data);
      setDespachoViendo(despacho);
      setVista('detalle');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md min-h-[80vh]">
      
      {vista === 'lista' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Despacho de Pedidos</h2>
              <p className="text-sm text-gray-500">Gestione y procese las órdenes de salida de mercancía</p>
            </div>
            <button onClick={cargarFormularioCreacion} className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 font-medium">
              + Nuevo Despacho
            </button>
          </div>

          <div className="flex space-x-4 bg-slate-50 p-4 rounded-lg items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700">Desde</label>
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="mt-1 border rounded p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Hasta</label>
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="mt-1 border rounded p-2 text-sm" />
            </div>
            <button onClick={() => cargarDespachos(fechaInicio, fechaFin)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Filtrar</button>
          </div>

          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 text-sm font-semibold">
              <tr>
                <th className="p-3"># Orden</th>
                <th className="p-3">Fecha y Hora</th>
                <th className="p-3">Cliente Destino</th>
                <th className="p-3">Operario</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {despachos.map(d => (
                <tr key={d.idDespacho} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-slate-700">ORD-{d.idDespacho.toString().padStart(5, '0')}</td>
                  <td className="p-3 text-gray-600">{new Date(d.fechaDespacho).toLocaleString('es-CR')}</td>
                  <td className="p-3 font-medium">{d.clienteNombre}</td>
                  <td className="p-3 text-gray-500">{d.operario}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      d.estado === 'PROCESADO' ? 'bg-green-100 text-green-800' : d.estado === 'CANCELADO' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>{d.estado}</span>
                  </td>
                  <td className="p-3 text-right">
                    {d.estado === 'PROCESADO' && (
                      <button onClick={() => verDetalles(d)} className="text-blue-600 hover:text-blue-800 font-medium">Ver Detalle</button>
                    )}
                  </td>
                </tr>
              ))}
              {despachos.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-500">No se encontraron despachos en este rango de fechas.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {vista === 'crear' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4 bg-slate-50 p-4 rounded-xl border">
            <h3 className="font-bold text-slate-800 border-b pb-2">Configuración del Pedido</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cliente Destino</label>
              <select value={clienteSeleccionado} onChange={e => setClienteSeleccionado(e.target.value)} className="w-full mt-1 border rounded p-2 text-sm">
                <option value="">Seleccione el cliente...</option>
                {clientes.map(c => <option key={c.idCliente} value={c.idCliente}>{c.nombre}</option>)}
              </select>
            </div>
            
            <div className="pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700">Agregar Producto</label>
              <select value={productoSeleccionado} onChange={e => setProductoSeleccionado(e.target.value)} className="w-full mt-1 border rounded p-2 text-sm">
                <option value="">Seleccione un producto disponible...</option>
                {productosDisponibles.map(p => <option key={p.idProducto} value={p.idProducto}>{p.codigo} - {p.nombre} (Disp: {p.cantidadActual})</option>)}
              </select>
            </div>
            <div className="flex space-x-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                <input type="number" min="1" value={cantidadInput} onChange={e => setCantidadInput(parseInt(e.target.value))} className="w-full mt-1 border rounded p-2 text-sm" />
              </div>
              <button onClick={agregarAlCarrito} className="bg-slate-700 text-white px-4 py-2 rounded text-sm hover:bg-slate-800">Agregar</button>
            </div>
            {error && <p className="text-xs text-red-600 bg-red-100 p-2 rounded">{error}</p>}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-slate-800">Carrito de Despacho (Temporal)</h3>
              <button onClick={() => setVista('lista')} className="text-sm text-gray-500 hover:text-gray-800">Cancelar Orden</button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 text-sm font-semibold">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3 text-center">A Despachar</th>
                  <th className="p-3 text-right">Quitar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {carrito.map(item => (
                  <tr key={item.producto.idProducto}>
                    <td className="p-3 text-gray-600">{item.producto.codigo}</td>
                    <td className="p-3 font-medium">{item.producto.nombre}</td>
                    <td className="p-3 text-center font-bold">{item.cantidad}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => quitarDelCarrito(item.producto.idProducto)} className="text-red-500 hover:text-red-700">Quitar</button>
                    </td>
                  </tr>
                ))}
                {carrito.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-400">El carrito está vacío. Agregue productos para procesar.</td></tr>}
              </tbody>
            </table>
            
            <div className="flex justify-end pt-4">
              <button onClick={procesarDespacho} disabled={carrito.length === 0 || !clienteSeleccionado} className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold disabled:opacity-50 transition-colors">
                Procesar Transacción
              </button>
            </div>
          </div>
        </div>
      )}

      {vista === 'detalle' && despachoViendo && (
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Detalle de Orden ORD-{despachoViendo.idDespacho.toString().padStart(5, '0')}</h2>
              <p className="text-sm text-gray-500">Despachado a: {despachoViendo.clienteNombre}</p>
            </div>
            <button onClick={() => setVista('lista')} className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">Volver</button>
          </div>
          <table className="w-full text-left border-collapse border">
            <thead className="bg-slate-100 text-slate-700 text-sm font-semibold border-b">
              <tr>
                <th className="p-3">Producto</th>
                <th className="p-3 text-center">Cantidad Procesada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {detallesViendo.map((d, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{d.productoNombre}</td>
                  <td className="p-3 text-center font-bold text-slate-700">{d.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}