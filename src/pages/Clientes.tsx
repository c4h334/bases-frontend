/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import api from '../services/api';

interface Cliente {
  idCliente: number;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  rolCliente: 'ORIGEN' | 'DESTINO' | 'AMBOS';
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [rolCliente, setRolCliente] = useState<'ORIGEN' | 'DESTINO' | 'AMBOS'>('ORIGEN');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const response = await api.get('/Clientes');
      setClientes(response.data);
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor.');
    }
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setNombre('');
    setTelefono('');
    setCorreo('');
    setDireccion('');
    setRolCliente('ORIGEN');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre del cliente no puede estar vacío.');
      return;
    }
    setError('');

    const payload = { 
      nombre, 
      telefono: telefono || null, 
      correo: correo || null, 
      direccion: direccion || null, 
      rolCliente 
    };

    try {
      if (editandoId) {
        await api.put(`/Clientes/${editandoId}`, { idCliente: editandoId, ...payload });
      } else {
        await api.post('/Clientes', payload);
      }
      
      await cargarClientes();
      limpiarFormulario();
    } catch (err) {
      console.error(err);
      setError('Hubo un error al guardar el cliente.');
    }
  };

  const iniciarEdicion = (cliente: Cliente) => {
    setEditandoId(cliente.idCliente);
    setNombre(cliente.nombre);
    setTelefono(cliente.telefono || '');
    setCorreo(cliente.correo || '');
    setDireccion(cliente.direccion || '');
    setRolCliente(cliente.rolCliente);
    setError('');
  };

  const eliminarCliente = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este cliente?')) return;
    
    try {
      await api.delete(`/Clientes/${id}`);
      await cargarClientes();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 500 || err.response?.status === 400) {
        alert('Error: No se puede eliminar un cliente que tiene recepciones o despachos asociados (Integridad Referencial).');
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-slate-500 focus:border-slate-500"
              placeholder="Teléfono de contacto"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-slate-500 focus:border-slate-500"
              placeholder="Correo electrónico"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dirección Física</label>
            <textarea
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-slate-500 focus:border-slate-500"
              placeholder="Dirección física"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rol Operativo</label>
            <select
              value={rolCliente}
              onChange={(e: any) => setRolCliente(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-slate-500 focus:border-slate-500"
            >
              <option value="ORIGEN">Origen (Solo Ingresos)</option>
              <option value="DESTINO">Destino (Solo Salidas)</option>
              <option value="AMBOS">Ambos Roles</option>
            </select>
          </div>
          
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 border border-red-200 rounded">{error}</p>}
          <div className="flex space-x-2">
            <button type="submit" className="flex-1 bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-800 transition-colors">
              {editandoId ? 'Actualizar' : 'Guardar'}
            </button>
            {editandoId && (
              <button type="button" onClick={limpiarFormulario} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2 overflow-hidden overflow-x-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Listado de Clientes de LogiChain</h2>
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="bg-slate-100 text-slate-700 text-sm font-semibold border-b">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Contacto</th>
              <th className="p-3">Rol</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {clientes.map(c => (
              <tr key={c.idCliente} className="hover:bg-gray-50">
                <td className="p-3 text-gray-500">#{c.idCliente.toString().padStart(4, '0')}</td>
                <td className="p-3 font-medium text-slate-800">{c.nombre}</td>
                <td className="p-3 text-gray-600">
                  <div>{c.telefono || 'Sin teléfono'}</div>
                  <div className="text-xs text-gray-400">{c.correo || 'Sin correo'}</div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    c.rolCliente === 'ORIGEN' ? 'bg-blue-100 text-blue-800' : c.rolCliente === 'DESTINO' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {c.rolCliente}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => iniciarEdicion(c)} className="text-slate-600 hover:text-slate-900 font-medium">Modificar</button>
                  <button onClick={() => eliminarCliente(c.idCliente)} className="text-red-600 hover:text-red-800 font-medium">
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