import { useState } from 'react';

interface Cliente {
  id: number;
  nombre: string;
  rol: 'origen' | 'destino' | 'ambos';
  tieneMovimientos: boolean;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([
    { id: 1, nombre: 'TechImport S.A.', rol: 'origen', tieneMovimientos: true },
    { id: 2, nombre: 'Almacenes del Istmo', rol: 'destino', tieneMovimientos: true },
    { id: 3, nombre: 'Distribuidora Global CR', rol: 'ambos', tieneMovimientos: false },
  ]);

  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<'origen' | 'destino' | 'ambos'>('origen');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre del cliente no puede estar vacío.'); // Validación
      return;
    }
    setError('');

    if (editandoId) {
      setClientes(clientes.map(c => c.id === editandoId ? { ...c, nombre, rol } : c));
      setEditandoId(null);
    } else {
      setClientes([...clientes, { id: Date.now(), nombre, rol, tieneMovimientos: false }]);
    }
    setNombre('');
    setRol('origen');
  };

  const iniciarEdicion = (cliente: Cliente) => {
    setEditandoId(cliente.id);
    setNombre(cliente.nombre);
    setRol(cliente.rol);
  };

  const eliminarCliente = (id: number, tieneMovimientos: boolean) => {
    if (tieneMovimientos) {
      alert('Error: No se pueden eliminar clientes que tengan movimientos asociados.'); // Restricción estricta
      return;
    }
    setClientes(clientes.filter(c => c.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulario */}
      <div className="bg-white p-6 rounded-xl shadow-md h-fit">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          {editandoId ? 'Modificar Cliente' : 'Registrar Nuevo Cliente'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre Corporativo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-slate-500 focus:border-slate-500"
              placeholder="Nombre de la empresa"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rol Operativo</label>
            <select
              value={rol}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRol(e.target.value as Cliente['rol'])}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-slate-500 focus:border-slate-500"
            >
              <option value="origen">Origen (Solo Ingresos)</option>
              <option value="destino">Destino (Solo Salidas)</option>
              <option value="ambos">Ambos Roles</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 border border-red-200 rounded">{error}</p>}
          <div className="flex space-x-2">
            <button type="submit" className="flex-1 bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-800 transition-colors">
              {editandoId ? 'Actualizar' : 'Guardar'}
            </button>
            {editandoId && (
              <button type="button" onClick={() => { setEditandoId(null); setNombre(''); }} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2 overflow-hidden">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Listado de Clientes de LogiChain</h2>
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 text-slate-700 text-sm font-semibold border-b">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Rol</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {clientes.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="p-3 text-gray-500">#{c.id.toString().slice(-4)}</td>
                <td className="p-3 font-medium text-slate-800">{c.nombre}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    c.rol === 'origen' ? 'bg-blue-100 text-blue-800' : c.rol === 'destino' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {c.rol.toUpperCase()}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => iniciarEdicion(c)} className="text-slate-600 hover:text-slate-900 font-medium">Modificar</button>
                  <button 
                    onClick={() => eliminarCliente(c.id, c.tieneMovimientos)} 
                    className={`font-medium ${c.tieneMovimientos ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
                    title={c.tieneMovimientos ? "Bloqueado por integridad referencial (tiene movimientos)" : ""}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}