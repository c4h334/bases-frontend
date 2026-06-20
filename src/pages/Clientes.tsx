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
      <div className="glass-card p-6 rounded-2xl soft-shadow h-fit space-y-4">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          {editandoId ? 'Modificar Cliente' : 'Registrar Nuevo Cliente'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Nombre Corporativo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm"
              placeholder="Nombre de la empresa"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Teléfono</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm"
              placeholder="Teléfono de contacto"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm"
              placeholder="Correo electrónico"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Dirección Física</label>
            <textarea
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm"
              placeholder="Dirección física"
              rows={3}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Rol Operativo</label>
            <select
              value={rolCliente}
              onChange={(e: any) => setRolCliente(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 transition-all text-sm"
            >
              <option value="ORIGEN">Origen (Solo Ingresos)</option>
              <option value="DESTINO">Destino (Solo Salidas)</option>
              <option value="AMBOS">Ambos Roles</option>
            </select>
          </div>
          
          {error && <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-3 border border-rose-100 rounded-xl">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-700 hover:to-violet-700 text-white py-2.5 rounded-xl font-semibold soft-shadow transition-all duration-200 cursor-pointer">
              {editandoId ? 'Actualizar' : 'Guardar'}
            </button>
            {editandoId && (
              <button type="button" onClick={limpiarFormulario} className="bg-slate-200/70 hover:bg-slate-200 border border-slate-300/40 text-slate-700 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 cursor-pointer">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="glass-card p-6 rounded-2xl soft-shadow lg:col-span-2 overflow-hidden flex flex-col">
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Listado de Clientes</h2>
          <p className="text-xs text-slate-400 mt-0.5">Socios comerciales registrados para orígenes y destinos de carga</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="bg-slate-50/75 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200/40">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Contacto</th>
                <th className="p-4">Rol</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {clientes.map(c => (
                <tr key={c.idCliente} className="hover:bg-slate-50/40 transition-colors duration-150">
                  <td className="p-4 text-slate-400 font-mono">#{c.idCliente.toString().padStart(4, '0')}</td>
                  <td className="p-4 font-semibold text-slate-850">{c.nombre}</td>
                  <td className="p-4">
                    <div className="font-medium text-slate-700">{c.telefono || 'Sin teléfono'}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{c.correo || 'Sin correo'}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-xs ${
                      c.rolCliente === 'ORIGEN' 
                        ? 'bg-sky-50 text-sky-700 border-sky-100' 
                        : c.rolCliente === 'DESTINO' 
                          ? 'bg-amber-50 text-amber-700 border-amber-100' 
                          : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                    }`}>
                      {c.rolCliente}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button 
                      onClick={() => iniciarEdicion(c)} 
                      className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/60 px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all duration-150 cursor-pointer"
                    >
                      Modificar
                    </button>
                    <button 
                      onClick={() => eliminarCliente(c.idCliente)} 
                      className="text-rose-600 hover:text-rose-850 hover:bg-rose-50/60 px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all duration-150 cursor-pointer"
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
    </div>
  );
}