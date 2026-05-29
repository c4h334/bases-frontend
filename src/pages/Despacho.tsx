import { useState } from 'react';

interface DespachoHistorial {
  numero: number;
  fecha: string;
  cliente: string;
  estado: 'procesado' | 'cancelado' | 'pendiente';
  operario: string;
}

interface ItemCarrito {
  id: string;
  nombre: string;
  cantidadSeleccionada: number;
  stockDisponible: number;
}

export default function Despacho() {
  const [historial] = useState<DespachoHistorial[]>([
    { numero: 1045, fecha: '2026-05-29 10:00', cliente: 'Almacenes del Istmo', estado: 'procesado', operario: 'mulate' },
    { numero: 1044, fecha: '2026-05-28 15:30', cliente: 'TechImport S.A.', estado: 'cancelado', operario: 'jmatias' }
  ]);

  const [inventarioStock] = useState([
    { id: 'PROD001', nombre: 'Smartphone Galaxy S24', stock: 15 },
    { id: 'PROD002', nombre: 'Memoria RAM DDR5 16GB', stock: 120 },
    { id: 'PROD003', nombre: 'Procesador Intel i9', stock: 0 } // No disponible
  ]);

  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [clienteSalida, setClienteSalida] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  const agregarAlCarrito = (prod: typeof inventarioStock[0]) => {
    if (prod.stock <= 0) return;
    const existe = carrito.find(item => item.id === prod.id);
    if (existe) {
      setCarrito(carrito.map(item => item.id === prod.id ? { ...item, cantidadSeleccionada: item.cantidadSeleccionada + 1 } : item));
    } else {
      setCarrito([...carrito, { id: prod.id, nombre: prod.nombre, cantidadSeleccionada: 1, stockDisponible: prod.stock }]);
    }
  };

  const procesarDespachoTransaccional = (simularError: boolean) => {
    if (!clienteSalida || carrito.length === 0) {
      alert('Debe definir el cliente destino y poseer artículos en la orden intermedia.');
      return;
    }

    if (simularError) {
      // Simula fallas de stock crítico -> ACID ROLLBACK
      alert('TRANSACTION ABORTED (ROLLBACK): Uno o más artículos sufrieron un desfase de stock en el servidor. El despacho pasará a estado CANCELADO.');
    } else {
      // Éxito -> ACID COMMIT
      alert('TRANSACTION COMMITTED (COMMIT): Despacho verificado de forma segura. El stock ha sido rebajado correctamente del inventario.');
    }
    
    // Obligatorio en ambos casos: Limpiar la tabla intermedia (carro de compras)
    setCarrito([]);
    setClienteSalida('');
  };

  return (
    <div className="space-y-6">
      {/* Panel de creación */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productos disponibles */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-bold text-slate-800 mb-3">1. Artículos con Existencia</h2>
          <div className="space-y-2">
            {inventarioStock.map(p => (
              <div key={p.id} className="flex justify-between items-center p-2 border rounded-lg text-sm">
                <div>
                  <p className="font-medium">{p.nombre}</p>
                  <p className="text-xs text-gray-500">Disponible: {p.stock} uds</p>
                </div>
                <button 
                  onClick={() => agregarAlCarrito(p)}
                  disabled={p.stock <= 0}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs disabled:bg-gray-200 disabled:text-gray-400"
                >
                  Añadir +
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Carrito intermedio */}
        <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2 flex flex-col justify-between border border-orange-100">
          <div>
            <h2 className="text-lg font-bold text-orange-900 mb-3">2. Orden de Salida Intermedia (Carro de Compras)</h2>
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-600 block">Cliente Destinatario</label>
              <input type="text" value={clienteSalida} onChange={(e) => setClienteSalida(e.target.value)} className="w-full mt-1 p-2 border rounded-lg text-sm" placeholder="Empresa destino" />
            </div>
            {carrito.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-6">No hay productos agregados a la orden intermedia.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500 text-xs">
                    <th className="pb-2">Producto</th>
                    <th className="pb-2 text-center">Cantidad Solicitada</th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map(item => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{item.nombre}</td>
                      <td className="py-2 text-center font-bold">{item.cantidadSeleccionada}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
            <button onClick={() => procesarDespachoTransaccional(true)} className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold text-sm">
              Simular Fallo (Rollback / Cancelado)
            </button>
            <button onClick={() => procesarDespachoTransaccional(false)} className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-semibold text-sm">
              Simular Éxito (Commit / Procesado)
            </button>
          </div>
        </div>
      </div>

      {/* Historial */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">Historial Semanal de Despachos</h2>
          <input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} className="p-1.5 border rounded-lg text-sm" />
        </div>
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50 border-b font-semibold text-gray-700">
            <tr>
              <th className="p-3">N° Orden</th>
              <th className="p-3">Fecha Generación</th>
              <th className="p-3">Cliente Destino</th>
              <th className="p-3">Operario</th>
              <th className="p-3 text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {historial.map(h => (
              <tr key={h.numero} className="hover:bg-gray-50">
                <td className="p-3 font-mono font-bold">#{h.numero}</td>
                <td className="p-3 text-gray-600">{h.fecha}</td>
                <td className="p-3 font-medium text-slate-800">{h.cliente}</td>
                <td className="p-3 text-gray-600 font-mono">{h.operario}</td>
                <td className="p-3 text-right">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${h.estado === 'procesado' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {h.estado.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}