import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';

export default function Layout() {
  return (
    <div className="min-h-screen mesh-bg font-sans antialiased text-slate-800">
      {/* El menú de navegación estático en la parte superior */}
      <Navbar />
      
      {/* Contenedor principal donde se inyectará cada módulo de forma dinámica */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="py-2">
          <Outlet />
        </div>
      </main>
    </div>
  );
}