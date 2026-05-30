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
      setError('Por favor, ingrese su usuario y contraseña.');
      return;
    }

    setError('');
    setCargando(true);

    try {
      const response = await api.post('/Auth/login', {
        username: username.trim(),
        password: password
      });

      localStorage.setItem('operario_username', response.data.username);
      navigate('/monitoreo');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error de login:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('No se pudo conectar con el servidor de autenticación.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">LogiChain Solutions</h1>
          <p className="mt-2 text-sm text-gray-500">Sistema de Gestión de Inventario (SGID)</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario de Base de Datos</label>
            <input
              type="text"
              disabled={cargando}
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-slate-500 focus:border-slate-500 disabled:bg-gray-100"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: amonge, joviedo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña del Servidor</label>
            <input
              type="password"
              disabled={cargando}
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-slate-500 focus:border-slate-500 disabled:bg-gray-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full px-4 py-2 text-white transition-colors bg-slate-700 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:bg-slate-400"
          >
            {cargando ? 'Verificando con MySQL...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}