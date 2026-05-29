import { useState } from 'react';

interface ProductoMonitoreo {
  id: string;
  nombre: string;
  ubicacion: string;
  existencias: number;
  stockCritico: number;
  ultimoIngreso: string;
  ultimoDespacho: string;
}

export default function Monitoreo() {
  // Datos de prueba ficticios coherentes (Requisito de datos de prueba)
  const [productos] = useState<ProductoMonitoreo[]>([
    { id: 'PROD001', nombre: 'Smartphone Galaxy S24', ubicacion: 'Bodega A - Pasillo 2 - Estante 4', existencias: 5, stockCritico: 15, ultimoIngreso: '2026-05-28 14:30', ultimoDespacho: '2026-05-29 09:15' },
    { id: 'PROD002', nombre: 'Memoria RAM DDR5 16GB', ubicacion: 'Bodega B - Pasillo 1 - Estante 2', existencias: 120, stockCritico: 30, ultimoIngreso: '2026-05-20 11:00', ultimoDespacho: '2026-05-27 16:45' },
    { id: 'PROD003', nombre: 'Procesador Intel i9 14th Gen', ubicacion: 'Bodega A - Pasillo 3 - Estante 1', existencias: 8, stockCritico: 10, ultimoIngreso: '2026-05-15 08:00', ultimoDespacho: '2026-05-25 13:20' },
    { id: 'PROD004', nombre: 'Disco Duro SSD 2TB', ubicacion: 'Bodega C - Pasillo 5 - Estante 3', existencias: 45, stockCritico: 20, ultimoIngreso: '2026-05-26 10:15', ultimoDespacho: '2026-05-28 11:10' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Monitoreo de Inventario en Tiempo Real</h1>
          <p className="text-sm text-gray-500">Panel general de existencias y alertas automáticas de reorden</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="w-3 h-3 bg-red-100 border border-red-400 rounded-full inline-block"></span>
          <span>Stock Crítico / Alerta de Reorden</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-700 text-white text-sm font-semibold">
            <tr>
              <th className="p-4">Código</th>
              <th className="p-4">Producto</th>
              <th className="p-4">Ubicación Física</th>
              <th className="p-4 text-center">Existencias</th>
              <th className="p-4 text-center">Stock Mínimo</th>
              <th className="p-4">Último Ingreso</th>
              <th className="p-4">Último Despacho</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {productos.map((prod) => {
              // Simulación de la función fn_VerificarAlertaStock de MySQL
              const esCritico = prod.existencias < prod.stockCritico;
              return (
                <tr 
                  key={prod.id} 
                  className={`transition-colors ${esCritico ? 'bg-red-50 text-red-900 font-medium' : 'hover:bg-gray-50'}`}
                >
                  <td className="p-4">{prod.id}</td>
                  <td className="p-4 flex items-center space-x-2">
                    {prod.nombre}
                    {esCritico && (
                      <span className="px-2 py-0.5 text-xs bg-red-200 text-red-800 rounded-full animate-pulse">
                        ⚠️ REORDEN
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-gray-600">{prod.ubicacion}</td>
                  <td className="p-4 text-center font-bold">{prod.existencias}</td>
                  <td className="p-4 text-center text-gray-500">{prod.stockCritico}</td>
                  <td className="p-4 text-gray-600">{prod.ultimoIngreso}</td>
                  <td className="p-4 text-gray-600">{prod.ultimoDespacho}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}