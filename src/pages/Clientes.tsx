/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Clientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [form, setForm] = useState({ nombre: '', telefono: '', correo: '', direccion: '', rolCliente: 'ORIGEN' });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try { setClientes((await api.get('/Clientes')).data); }
    catch { setError('Error al cargar clientes.'); }
  };

  const limpiar = () => { setEditandoId(null); setForm({ nombre: '', telefono: '', correo: '', direccion: '', rolCliente: 'ORIGEN' }); setError(''); };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return; }
    try {
      if (editandoId) {
        await api.put(`/Clientes/${editandoId}`, { idCliente: editandoId, ...form });
      } else {
        await api.post('/Clientes', form);
      }
      await cargar(); limpiar();
    } catch { setError('Error al guardar cliente.'); }
  };

  const eliminar = async (id: number) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    try { await api.delete(`/Clientes/${id}`); cargar(); }
    catch { alert('No se puede eliminar: tiene movimientos asociados.'); }
  };

  const s = { input: { width: '100%', padding: '0.4rem', border: '1px solid #ccc', boxSizing: 'border-box' as const, marginTop: '0.2rem' }, btn: (color = '#333') => ({ padding: '0.4rem 0.8rem', background: color, color: '#fff', border: 'none', cursor: 'pointer', marginRight: '0.4rem' }), label: { display: 'block' as const, marginBottom: '0.75rem' } };

  return (
    <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>

      {/* Formulario */}
      <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>{editandoId ? 'Editar cliente' : 'Nuevo cliente'}</h3>
        <form onSubmit={guardar}>
          <label style={s.label}>Nombre <input style={s.input} required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></label>
          <label style={s.label}>Teléfono <input style={s.input} value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} /></label>
          <label style={s.label}>Correo <input style={s.input} type="email" value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} /></label>
          <label style={s.label}>Dirección <input style={s.input} value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} /></label>
          <label style={s.label}>
            Rol
            <select style={s.input} value={form.rolCliente} onChange={e => setForm({ ...form, rolCliente: e.target.value })}>
              <option value="ORIGEN">ORIGEN (proveedores)</option>
              <option value="DESTINO">DESTINO (clientes)</option>
              <option value="AMBOS">AMBOS</option>
            </select>
          </label>
          {error && <p style={{ color: 'red', fontSize: '0.85rem' }}>{error}</p>}
          <button type="submit" style={s.btn()}>{editandoId ? 'Actualizar' : 'Guardar'}</button>
          {editandoId && <button type="button" style={s.btn('#888')} onClick={limpiar}>Cancelar</button>}
        </form>
      </div>

      {/* Tabla */}
      <div>
        <h2 style={{ marginTop: 0 }}>Clientes registrados</h2>
        <table border={1} cellPadding={5} cellSpacing={0} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead style={{ background: '#eee' }}>
            <tr><th>ID</th><th>Nombre</th><th>Contacto</th><th>Rol</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.idCliente}>
                <td>#{c.idCliente}</td>
                <td>{c.nombre}</td>
                <td>{c.telefono || '—'}<br /><small>{c.correo || '—'}</small></td>
                <td><strong>{c.rolCliente}</strong></td>
                <td>
                  <button style={s.btn()} onClick={() => { setEditandoId(c.idCliente); setForm({ nombre: c.nombre, telefono: c.telefono || '', correo: c.correo || '', direccion: c.direccion || '', rolCliente: c.rolCliente }); setError(''); }}>Editar</button>
                  <button style={s.btn('#c33')} onClick={() => eliminar(c.idCliente)}>Borrar</button>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999' }}>Sin clientes.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
