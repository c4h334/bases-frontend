import { useState } from 'react';

interface ProductoInventario {
  codigo: string;
  nombre: string;
  detalle: string;
  existencias: number;
  stockCritico: number;
  ubicacion: string;
  tieneMovimientos: boolean;
}

export default function Recepcion() {
  const [productos, setProductos] = useState<ProductoInventario[]>([
    { codigo: 'PROD001', nombre: 'Smartphone Galaxy S24', detalle: 'Alta gama 256GB', existencias: 5, stockCritico: 15, ubicacion: 'Bodega A - Pasillo 2', tieneMovimientos: true },
    { codigo: 'PROD002', nombre: 'Memoria RAM DDR5 16GB', detalle: 'Frecuencia 5200MHz', existencias: 120, stockCritico: 30, ubicacion: 'Bodega B - Pasillo 1', tieneMovimientos: false }
  ]);

  // Estados del Formulario de Aprovisionamiento
  const [selectedProd, setSelectedProd] = useState('');
  const [lote, setLote] = useState('');
  const [cliente, setCliente] = useState('');
  const [cantidad, setCantidad] = useState(0);

  // Estados del Formulario de Catálogo de Productos
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [detalle, setDetalle] = useState('');
  const [stockCritico, setStockCritico] = useState(0);
  const [ubicacion, setUbicacion] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);

  const ejecutarRecepcion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProd || !lote || !cliente || cantidad <= 0) {
      alert('Campos de recepción inválidos o vacíos.');
      return;
    }
    // Invoca sp_RegistrarRecepcion simulado
    setProductos(productos.map(p => p.codigo === selectedProd ? { ...p, existencias: p.existencias + cantidad, tieneMovimientos: true } : p));
    alert('Ingreso procesado con éxito de forma atómica.');
    setLote(''); setCliente(''); setCantidad(0);
  };

  const guardarProductoCatalogo = (e: React.FormEvent) => {
    e.preventDefault();
    if (modoEdicion) {
      setProductos(productos.map(p => p.codigo === codigo ? { ...p, nombre, detalle, stockCritico, ubicacion } : p));
      setModoEdicion(false);
    } else {
      setProductos([...productos, { codigo, nombre, detalle, existencias: 0, stockCritico, ubicacion, tieneMovimientos: false }]);
    }
    limpiarFormCatalogo();
  };

  const iniciarModificacionProducto = (p: ProductoInventario) => {
    setModoEdicion(true);
    setCodigo(p.codigo); setNombre(p.nombre); setDetalle(p.detalle); setStockCritico(p.stockCritico); setUbicacion(p.ubicacion);
  };

  const eliminarProductoCatalogo = (codigo: string, tieneMovimientos: boolean) => {
    if (tieneMovimientos) {
      alert('No se puede eliminar: el producto posee registros históricos asociados.');
      return;
    }
    setProductos(productos.filter(p => p.codigo !== codigo));
  };

  const limpiarFormCatalogo = () => {
    setCodigo(''); setNombre(''); setDetalle(''); setStockCritico(0); setUbicacion(''); setModoEdicion(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulario 1: Transacción de Entrada */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Formulario de Aprovisionamiento (Entradas)</h2>
          <form onSubmit={ejecutarRecepcion} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Seleccionar Producto</label>
              <select value={selectedProd} onChange={(e) => setSelectedProd(e.target.value)} className="w-full mt-1 p-2 border rounded-lg">
                <option value="">-- Elija un artículo --</option>
                {productos.map(p => <option key={p.codigo} value={p.codigo}>{p.nombre} ({p.codigo})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Número de Lote</label>
                <input type="text" value={lote} onChange={(e) => setLote(e.target.value)} className="w-full mt-1 p-2 border rounded-lg" placeholder="LOT-XXXX" />
              </div>
              <div>
                <label className="text-sm font-medium">Cliente Proveedor</label>
                <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} className="w-full mt-1 p-2 border rounded-lg" placeholder="Nombre origen" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Cantidad a Recibir</label>
              <input type="number" value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value) || 0)} className="w-full mt-1 p-2 border rounded-lg" />
            </div>
            <button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition-colors">
              Confirmar Registro de Recepción (sp_RegistrarRecepcion)
            </button>
          </form>
        </div>

        {/* Formulario 2: Catálogo CRUD */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-slate-800 mb-4">{modoEdicion ? 'Modificar Parámetros de Producto' : 'Registrar Nuevo Producto en Catálogo'}</h2>
          <form onSubmit={guardarProductoCatalogo} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Código</label>
                <input type="text" disabled={modoEdicion} value={codigo} onChange={(e) => setCodigo(e.target.value)} className="w-full mt-1 p-2 border rounded-lg bg-gray-50 disabled:text-gray-400" placeholder="PRODXXX" />
              </div>
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full mt-1 p-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Stock Crítico</label>
                <input type="number" value={stockCritico} onChange={(e) => setStockCritico(parseInt(e.target.value) || 0)} className="w-full mt-1 p-2 border rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-medium">Ubicación Almacén</label>
                <input type="text" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} className="w-full mt-1 p-2 border rounded-lg" placeholder="Bodega X - Pasillo Y - Estante Z" />
              </div>
            </div>
            <p className="text-xs text-orange-600 font-medium">⚠️ Nota institucional: Está prohibida la alteración de cantidades de inventario de manera manual desde este panel.</p>
            <div className="flex space-x-2">
              <button type="submit" className="flex-1 bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-800">Guardar</button>
              {modoEdicion && <button type="button" onClick={limpiarFormCatalogo} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">Cancelar</button>}
            </div>
          </form>
        </div>
      </div>

      {/* Tabla del Catálogo */}
      <div className="bg-white p-6 rounded-xl shadow-md overflow-hidden">
        <h3 className="text-lg font-bold text-slate-800 mb-3">Catálogo Actual de Artículos</h3>
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-100 border-b font-semibold">
            <tr>
              <th className="p-3">Código</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Ubicación</th>
              <th className="p-3 text-center">Existencias Físicas</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productos.map(p => (
              <tr key={p.codigo} className="hover:bg-gray-50">
                <td className="p-3 font-mono">{p.codigo}</td>
                <td className="p-3 font-medium">{p.nombre}</td>
                <td className="p-3 text-gray-600">{p.ubicacion}</td>
                <td className="p-3 text-center font-bold text-slate-700">{p.existencias}</td>
                <td className="p-3 text-right space-x-3">
                  <button onClick={() => iniciarModificacionProducto(p)} className="text-slate-600 hover:text-slate-900 font-medium">Modificar</button>
                  <button onClick={() => eliminarProductoCatalogo(p.codigo, p.tieneMovimientos)} className={`font-medium ${p.tieneMovimientos ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}