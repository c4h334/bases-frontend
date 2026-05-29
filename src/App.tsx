import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Monitoreo from './pages/Monitoreo';
import Clientes from './pages/Clientes';
import Recepcion from './pages/Recepcion';
import Despacho from './pages/Despacho';
import Auditoria from './pages/Auditoria';

function App() {
  return (
    <Router>
      <div className="font-sans text-gray-900">
        <Routes>
          <Route path="/" element={<Login />} />
          
          <Route element={<Layout />}>
            <Route path="/monitoreo" element={<Monitoreo />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/recepcion" element={<Recepcion />} />
            <Route path="/despacho" element={<Despacho />} />
            <Route path="/auditoria" element={<Auditoria />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;