import { NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const operarioLogueado = localStorage.getItem('operario_username') || 'Operador';

  const handleLogout = () => {
    localStorage.removeItem('operario_username');
    navigate('/');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-250 ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 soft-shadow border border-indigo-100/60'
        : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
    }`;

  return (
    <nav className="glass-nav sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm shadow-indigo-200">
                L
              </div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-650 to-violet-650 font-black text-lg tracking-wider">
                LOGICHAIN
              </span>
            </div>
            
            <div className="hidden md:block ml-10">
              <div className="flex space-x-1">
                <NavLink to="/monitoreo" className={linkClass}>
                  <svg className="w-4.5 h-4.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                  Monitoreo
                </NavLink>
                <NavLink to="/clientes" className={linkClass}>
                  <svg className="w-4.5 h-4.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Clientes
                </NavLink>
                <NavLink to="/recepcion" className={linkClass}>
                  <svg className="w-4.5 h-4.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                  </svg>
                  Recepción
                </NavLink>
                <NavLink to="/despacho" className={linkClass}>
                  <svg className="w-4.5 h-4.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7 7 7M5 19l7-7 7 7" />
                  </svg>
                  Despachos
                </NavLink>
                <NavLink to="/auditoria" className={linkClass}>
                  <svg className="w-4.5 h-4.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Auditoría
                </NavLink>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-650 text-xs hidden sm:inline font-semibold">
                Conectado: <span className="font-extrabold text-slate-850">{operarioLogueado}</span>
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 text-rose-650 border border-rose-200/40 rounded-xl text-sm font-bold transition-all duration-250 focus:outline-none focus:ring-4 focus:ring-rose-100 cursor-pointer shadow-3xs"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}