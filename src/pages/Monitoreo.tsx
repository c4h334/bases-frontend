import { useState, useEffect } from 'react';
import api from '../services/api';

interface Producto {
  idProducto: number;
  codigo: string;
  nombre: string;
  bodega: string;
  pasillo: string;
  estante: string;
  cantidadActual: number;
  stockCritico: number;
  ultimoIngreso: string | null;
  ultimoDespacho: string | null;
  estadoAlerta: string;
}

export default function Monitoreo() {
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    const cargarInventario = async () => {
      try {
        const response = await api.get('/Productos');
        setProductos(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    
    cargarInventario();
    
    const interval = setInterval(cargarInventario, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'Sin registros';
    return new Date(fecha).toLocaleString('es-CR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

      <div className="bg-white rounded-xl shadow-md overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="bg-slate-700 text-white text-sm font-semibold">
            <tr>
              <th className="p-4">Código</th>
              <th className="p-4">Producto</th>
              <th className="p-4">Ubicación Física</th>
              <th className="p-4 text-center">Último Ingreso</th>
              <th className="p-4 text-center">Último Despacho</th>
              <th className="p-4 text-center">Existencias</th>
              <th className="p-4 text-center">Stock Mínimo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {productos.map((prod) => {
              const esCritico = prod.estadoAlerta === 'REORDEN';
              return (
                <tr 
                  key={prod.idProducto} 
                  className={`transition-colors ${esCritico ? 'bg-red-50 text-red-900 font-medium' : 'hover:bg-gray-50'}`}
                >
                  <td className="p-4">{prod.codigo}</td>
                  <td className="p-4 flex items-center space-x-2">
                    <span>{prod.nombre}</span>
                    {esCritico && (
                      <span className="px-2 py-0.5 text-xs bg-red-200 text-red-800 rounded-full animate-pulse">
                        ⚠️ REORDEN
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-gray-600">{`${prod.bodega} - ${prod.pasillo} - ${prod.estante}`}</td>
                  <td className="p-4 text-center text-gray-600">{formatearFecha(prod.ultimoIngreso)}</td>
                  <td className="p-4 text-center text-gray-600">{formatearFecha(prod.ultimoDespacho)}</td>
                  <td className="p-4 text-center font-bold">{prod.cantidadActual}</td>
                  <td className="p-4 text-center text-gray-500">{prod.stockCritico}</td>
                </tr>
              );
            })}
            {productos.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">Cargando datos desde el servidor o inventario vacío...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}