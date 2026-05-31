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
      const res = await api.get(`/Recepcion/Producto/${idProducto}`);
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
      await api.post('/Recepcion', {
        idProducto: productoSeleccionado?.idProducto,
        idCliente: parseInt(formRecepcion.idCliente),
        numeroLote: formRecepcion.numeroLote,
        cantidadEntrante: formRecepcion.cantidad,
        usuarioAtencion: 'Sistema' 
      });
      alert('Lote recibido y stock actualizado con éxito.');
      setVista('lista');
    } catch (err) {
      console.error(err);
      setError('Error al registrar la recepción del lote.');
    }
  };

  const abrirHistorial = (prod: Producto) => {
    setProductoSeleccionado(prod);
    cargarHistorial(prod.idProducto);
    setVista('historial');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md min-h-[80vh]">
      
      {/* VISTA 1: LISTADO PRINCIPAL */}
      {vista === 'lista' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Aprovisionamiento y Catálogo</h2>
              <p className="text-sm text-gray-500">Gestione los productos y registre la entrada de nuevos lotes</p>
            </div>
            <button onClick={abrirFormNuevoProducto} className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 font-medium">
              + Nuevo Producto
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 text-sm font-semibold">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Ubicación</th>
                  <th className="p-3 text-center">Stock</th>
                  <th className="p-3 text-center">Acciones de Inventario</th>
                  <th className="p-3 text-right">Mantenimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {productos.map(p => (
                  <tr key={p.idProducto} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-slate-700">{p.codigo}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{p.nombre}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{p.detalle}</div>
                    </td>
                    <td className="p-3 text-gray-600">{`${p.bodega} > ${p.pasillo} > ${p.estante}`}</td>
                    <td className="p-3 text-center font-bold text-slate-800">{p.cantidadActual}</td>
                    <td className="p-3 text-center space-x-2">
                      <button onClick={() => abrirFormRecepcion(p)} className="bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 font-medium">
                        Recibir Lote
                      </button>
                      <button onClick={() => abrirHistorial(p)} className="bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 font-medium">
                        Ver Entradas
                      </button>
                    </td>
                    <td className="p-3 text-right space-x-3">
                      <button onClick={() => abrirFormEditarProducto(p)} className="text-slate-600 hover:text-slate-900 font-medium">Editar</button>
                      <button onClick={() => eliminarProducto(p.idProducto)} className="text-red-600 hover:text-red-800 font-medium">Borrar</button>
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
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-bold text-slate-800">{productoSeleccionado ? 'Editar Producto' : 'Crear Nuevo Producto'}</h2>
            <p className="text-sm text-gray-500">
              {productoSeleccionado ? 'Nota: La cantidad en inventario solo puede ser alterada mediante recepciones o despachos.' : 'Ingrese los detalles de catalogación y ubicación física.'}
            </p>
          </div>

          <form onSubmit={guardarProducto} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Código</label>
              <input type="text" required value={formProducto.codigo} onChange={e => setFormProducto({...formProducto, codigo: e.target.value})} className="w-full mt-1 border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input type="text" required value={formProducto.nombre} onChange={e => setFormProducto({...formProducto, nombre: e.target.value})} className="w-full mt-1 border rounded p-2" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Detalle / Descripción</label>
              <textarea value={formProducto.detalle} onChange={e => setFormProducto({...formProducto, detalle: e.target.value})} className="w-full mt-1 border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bodega</label>
              <input type="text" required value={formProducto.bodega} onChange={e => setFormProducto({...formProducto, bodega: e.target.value})} className="w-full mt-1 border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pasillo</label>
              <input type="text" required value={formProducto.pasillo} onChange={e => setFormProducto({...formProducto, pasillo: e.target.value})} className="w-full mt-1 border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estante</label>
              <input type="text" required value={formProducto.estante} onChange={e => setFormProducto({...formProducto, estante: e.target.value})} className="w-full mt-1 border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock Crítico (Alerta)</label>
              <input type="number" min="0" required value={formProducto.stockCritico} onChange={e => setFormProducto({...formProducto, stockCritico: parseInt(e.target.value)})} className="w-full mt-1 border rounded p-2" />
            </div>

            {error && <div className="col-span-2 text-red-600 bg-red-50 p-2 rounded text-sm">{error}</div>}

            <div className="col-span-2 flex space-x-3 mt-4">
              <button type="submit" className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-700">Guardar Producto</button>
              <button type="button" onClick={() => setVista('lista')} className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* VISTA 3: FORMULARIO DE RECEPCIÓN */}
      {vista === 'formRecepcion' && productoSeleccionado && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="border-b pb-4 bg-slate-50 p-4 rounded-lg">
            <h2 className="text-xl font-bold text-slate-800">Registrar Recepción de Lote</h2>
            <p className="text-slate-600 mt-1">Producto: <strong>{productoSeleccionado.codigo} - {productoSeleccionado.nombre}</strong></p>
            <p className="text-sm text-slate-500">Stock Actual: {productoSeleccionado.cantidadActual}</p>
          </div>

          <form onSubmit={registrarRecepcion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cliente de Origen</label>
              <select required value={formRecepcion.idCliente} onChange={e => setFormRecepcion({...formRecepcion, idCliente: e.target.value})} className="w-full mt-1 border rounded p-2">
                <option value="">Seleccione un proveedor/cliente...</option>
                {clientes.map(c => <option key={c.idCliente} value={c.idCliente}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Número de Lote (Rastreo)</label>
              <input type="text" required value={formRecepcion.numeroLote} onChange={e => setFormRecepcion({...formRecepcion, numeroLote: e.target.value})} className="w-full mt-1 border rounded p-2" placeholder="Ej. LOTE-2026-X" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cantidad Entrante</label>
              <input type="number" min="1" required value={formRecepcion.cantidad} onChange={e => setFormRecepcion({...formRecepcion, cantidad: parseInt(e.target.value)})} className="w-full mt-1 border rounded p-2" />
            </div>

            {error && <div className="text-red-600 bg-red-50 p-2 rounded text-sm">{error}</div>}

            <div className="flex space-x-3 pt-4">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-medium">Procesar Ingreso</button>
              <button type="button" onClick={() => setVista('lista')} className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* VISTA 4: HISTORIAL DE RECEPCIONES */}
      {vista === 'historial' && productoSeleccionado && (
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Historial de Ingresos</h2>
              <p className="text-sm text-gray-500">Producto: {productoSeleccionado.nombre}</p>
            </div>
            <button onClick={() => setVista('lista')} className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
              Volver al Catálogo
            </button>
          </div>

          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 text-sm font-semibold">
              <tr>
                <th className="p-3">Fecha y Hora</th>
                <th className="p-3">Lote</th>
                <th className="p-3">Cliente Proveedor</th>
                <th className="p-3 text-center">Cantidad Recibida</th>
                <th className="p-3">Operario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {historial.map(h => (
                <tr key={h.idDetalleRecepcion} className="hover:bg-green-50">
                  <td className="p-3 text-gray-600">{new Date(h.fechaRecepcion).toLocaleString('es-CR')}</td>
                  <td className="p-3 font-medium text-slate-700">{h.numeroLote}</td>
                  <td className="p-3">{h.clienteNombre}</td>
                  <td className="p-3 text-center font-bold text-green-700">+{h.cantidad}</td>
                  <td className="p-3 text-gray-500">{h.usuarioAtendio}</td>
                </tr>
              ))}
              {historial.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-gray-500">No hay registros de ingreso para este producto.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}