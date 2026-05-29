import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aquí validamos que no envíen campos vacíos (Requisito del proyecto)
    if (!username || !password) {
      setError('Por favor, ingrese su usuario y contraseña.');
      return;
    }

    // TODO: Aquí luego conectaremos con axios a tu backend en .NET
    // Por ahora, simularemos un error para cumplir con el requisito visual
    if (username === 'admin' && password === '123') {
      setError('');
      navigate('/monitoreo'); // Redirección temporal al menú principal
    } else {
      setError('Usuario o contraseña incorrectos. Acceso denegado.');
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
            <label className="block text-sm font-medium text-gray-700">Usuario</label>
            <input
              type="text"
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-slate-500 focus:border-slate-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: jmatias"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-slate-500 focus:border-slate-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {/* Mensaje de error dinámico */}
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 text-white transition-colors bg-slate-700 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}