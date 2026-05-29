import { NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí puedes limpiar tokens de autenticación o estados locales en el futuro
    navigate('/');
  };

  // Clase utilitaria para manejar el estado visual activo/inactivo de los enlaces
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-slate-900 text-white'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;

  return (
    <nav className="bg-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Nombre Corporativo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 text-white font-bold text-xl tracking-wider">
              LOGICHAIN
            </div>
            
            {/* Opciones del Menú de Navegación */}
            <div className="hidden md:block ml-10">
              <div className="flex space-x-4">
                <NavLink to="/monitoreo" className={linkClass}>
                  Monitoreo
                </NavLink>
                <NavLink to="/clientes" className={linkClass}>
                  Clientes
                </NavLink>
                <NavLink to="/recepcion" className={linkClass}>
                  Recepción
                </NavLink>
                <NavLink to="/despacho" className={linkClass}>
                  Despachos
                </NavLink>
                <NavLink to="/auditoria" className={linkClass}>
                  Auditoría
                </NavLink>
              </div>
            </div>
          </div>

          {/* Sección Derecha: Usuario y Botón de Salida */}
          <div className="flex items-center space-x-4">
            <span className="text-slate-400 text-xs hidden sm:inline">
              Conectado como: Operario
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}