import { NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const operarioLogueado = localStorage.getItem('operario_username') || 'Operador';

  const handleLogout = () => {
    localStorage.removeItem('operario_username');
    navigate('/');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-indigo-55 text-indigo-700 soft-shadow border border-indigo-100/50'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <nav className="glass-nav sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 font-extrabold text-xl tracking-wider">
              LOGICHAIN
            </div>
            
            <div className="hidden md:block ml-10">
              <div className="flex space-x-2">
                <NavLink to="/monitoreo" className={linkClass}>Monitoreo</NavLink>
                <NavLink to="/clientes" className={linkClass}>Clientes</NavLink>
                <NavLink to="/recepcion" className={linkClass}>Recepción</NavLink>
                <NavLink to="/despacho" className={linkClass}>Despachos</NavLink>
                <NavLink to="/auditoria" className={linkClass}>Auditoría</NavLink>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-600 text-xs hidden sm:inline font-medium">
                Conectado: <span className="font-semibold text-slate-800">{operarioLogueado}</span>
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/40 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-rose-100"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}