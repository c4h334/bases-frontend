import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Ingrese usuario y contraseña.');
      return;
    }
    setError('');
    setCargando(true);
    try {
      const res = await api.post('/Auth/login', { username: username.trim(), password });
      localStorage.setItem('operario_username', res.data.username);
      navigate('/monitoreo');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f0f0' }}>
      <div style={{ background: '#fff', border: '1px solid #ccc', padding: '2rem', width: '320px' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>LogiChain Solutions</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Sistema de Gestión de Inventario — SGID</p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Usuario de BD</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={cargando}
              placeholder="Ej: joviedo, amonge"
              style={{ width: '100%', padding: '0.4rem', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={cargando}
              style={{ width: '100%', padding: '0.4rem', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          {error && <p style={{ color: 'red', marginBottom: '0.75rem', fontSize: '0.85rem' }}>{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            style={{ width: '100%', padding: '0.5rem', background: '#333', color: '#fff', border: 'none', cursor: cargando ? 'not-allowed' : 'pointer' }}
          >
            {cargando ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
