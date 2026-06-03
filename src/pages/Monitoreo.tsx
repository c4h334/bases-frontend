import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Monitoreo() {
    const [productos, setProductos] = useState([]);
    const [alertas, setAlertas] = useState<Record<number, string>>({});

    useEffect(() => {
        // CORRECCIÓN: Utilizamos la instancia 'api' para apuntar al backend C#
        api.get('/Productos/monitoreo')
            .then(res => {
                const data = res.data;
                setProductos(data);
                data.forEach((p: any) => {
                    api.get(`/Productos/${p.idProducto}/alerta-stock`)
                        .then(r => setAlertas(prev => ({ ...prev, [p.idProducto]: r.data.estado })));
                });
            })
            .catch(err => console.error("Error al cargar monitoreo:", err));
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Monitoreo de Inventario en Tiempo Real</h2>
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500 border">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Producto</th>
                            <th className="px-6 py-3">Ubicación</th>
                            <th className="px-6 py-3">Existencias</th>
                            <th className="px-6 py-3">Último Ingreso</th>
                            <th className="px-6 py-3">Último Despacho</th>
                            <th className="px-6 py-3">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map((p: any) => {
                            const isAlert = alertas[p.idProducto] === 'REORDEN';
                            return (
                                <tr key={p.idProducto} className="border-b" style={{ backgroundColor: isAlert ? '#fca5a5' : 'transparent', color: isAlert ? '#7f1d1d' : 'inherit' }}>
                                    <td className="px-6 py-4">{p.codigo} - {p.nombre}</td>
                                    <td className="px-6 py-4">{p.bodega} - Pasillo {p.pasillo} - Est. {p.estante}</td>
                                    <td className="px-6 py-4 font-bold">{p.cantidadActual}</td>
                                    <td className="px-6 py-4">{p.ultimoIngreso ? new Date(p.ultimoIngreso).toLocaleString() : 'N/A'}</td>
                                    <td className="px-6 py-4">{p.ultimoDespacho ? new Date(p.ultimoDespacho).toLocaleString() : 'N/A'}</td>
                                    <td className="px-6 py-4">{isAlert ? '⚠️ REORDEN' : 'OK'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
