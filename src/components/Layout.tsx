import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* El menú de navegación estático en la parte superior */}
      <Navbar />
      
      {/* Contenedor principal donde se inyectará cada módulo de forma dinámica */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}