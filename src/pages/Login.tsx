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
    <div className="flex items-center justify-center min-h-screen mesh-bg px-4">
      <div className="w-full max-w-md p-8 space-y-8 glass-card rounded-3xl premium-shadow">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-extrabold text-2xl soft-shadow mb-2">
            L
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-650 to-violet-650">
            LogiChain Solutions
          </h1>
          <p className="text-sm font-medium text-slate-500">Sistema de Gestión de Inventario (SGID)</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Usuario de Base de Datos</label>
            <input
              type="text"
              disabled={cargando}
              className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all disabled:bg-slate-100 text-slate-800 placeholder-slate-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: amonge, joviedo"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Contraseña del Servidor</label>
            <input
              type="password"
              disabled={cargando}
              className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all disabled:bg-slate-100 text-slate-800 placeholder-slate-450"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full px-4 py-3 text-white font-semibold transition-all duration-300 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl hover:shadow-lg hover:shadow-indigo-200/40 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-50 cursor-pointer"
          >
            {cargando ? 'Verificando con MySQL...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}