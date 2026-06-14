import { NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const operario = localStorage.getItem('operario_username') || 'Operador';

  const handleLogout = () => {
    localStorage.removeItem('operario_username');
    navigate('/');
  };

  const linkStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '0.4rem 0.8rem',
    background: isActive ? '#000' : 'transparent',
    color: isActive ? '#fff' : '#ddd',
    textDecoration: 'none',
    borderRadius: '3px',
  });

  return (
    <nav style={{ background: '#222', padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: '#fff', fontWeight: 'bold', marginRight: '1rem' }}>LOGICHAIN</span>
        <NavLink to="/monitoreo" style={({ isActive }) => linkStyle(isActive)}>Monitoreo</NavLink>
        <NavLink to="/clientes" style={({ isActive }) => linkStyle(isActive)}>Clientes</NavLink>
        <NavLink to="/recepcion" style={({ isActive }) => linkStyle(isActive)}>Recepción</NavLink>
        <NavLink to="/despacho" style={({ isActive }) => linkStyle(isActive)}>Despachos</NavLink>
        <NavLink to="/auditoria" style={({ isActive }) => linkStyle(isActive)}>Auditoría</NavLink>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: '#aaa', fontSize: '0.85rem' }}>Usuario: {operario}</span>
        <button onClick={handleLogout} style={{ padding: '0.3rem 0.8rem', background: '#c33', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Salir
        </button>
      </div>
    </nav>
  );
}
