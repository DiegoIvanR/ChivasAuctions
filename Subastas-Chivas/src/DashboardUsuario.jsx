import React, { useState } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import './DashboardUsuario.css';

const DashboardUsuario = () => {
  const [articulosGanados, setArticulosGanados] = useState(1);
  const [pujasRealizadas, setPujasRealizadas] = useState(1);
  const [articulosPujados, setArticulosPujados] = useState(1);

  return (
    <div
      style={{
        backgroundImage: 'url("/estadio-interior.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        color: 'white',
        position: 'relative'
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 0
      }}></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <header style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="Logo" style={{ height: '40px', marginRight: '10px' }} />
            <nav>
              <Link to="/en-vivo" style={{ marginRight: '15px', color: 'white', textDecoration: 'none' }}>En Vivo</Link>
              <Link to="/varonil" style={{ marginRight: '15px', color: 'white', textDecoration: 'none' }}>Varonil</Link>
              <Link to="/femenil" style={{ color: 'white', textDecoration: 'none' }}>Femenil</Link>
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" placeholder="Busca a un jugador o partido" style={{ padding: '5px 10px', borderRadius: '20px', border: 'none', marginRight: '10px' }} />
            <button style={{ background: 'transparent', border: 'none', color: 'white' }}>❤️</button>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#ccc', borderRadius: '50%' }}></div>
          </div>
        </header>

        <main style={{ padding: '20px' }}>
          <h1 style={{ marginBottom: '10px' }}>GONZALO ROJAS</h1>
          <hr style={{ marginBottom: '20px' }} />
          <div style={{ display: 'flex' }}>
            <aside style={{ width: '200px' }}>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '15px' }}><Link to="/dashboard/perfil" style={{ color: 'white', textDecoration: 'none' }}>Mi Perfil</Link></li>
                <li style={{ marginBottom: '15px' }}><Link to="/dashboard/pujas" style={{ color: 'white', textDecoration: 'none' }}>Mis Pujas</Link></li>
                <li style={{ marginBottom: '15px' }}><Link to="/dashboard/pedidos" style={{ color: 'white', textDecoration: 'none' }}>Mis Pedidos</Link></li>
                <li style={{ marginBottom: '15px' }}><Link to="/dashboard/ajustes" style={{ color: 'white', textDecoration: 'none' }}>Ajustes</Link></li>
                <li style={{ marginBottom: '15px' }}><Link to="/logout" style={{ color: 'white', textDecoration: 'none' }}>Cerrar sesión</Link></li>
              </ul>
            </aside>
            <section style={{ flexGrow: 1, display: 'flex', justifyContent: 'space-around', marginLeft: '20px', gap: '20px' }}>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '30px 20px', borderRadius: '10px', textAlign: 'center' }}>
                <h2>{articulosGanados}</h2>
                <p>Artículos Ganados</p>
              </div>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '30px 20px', borderRadius: '10px', textAlign: 'center' }}>
                <h2>{pujasRealizadas}</h2>
                <p>Total de Pujas Realizadas</p>
              </div>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '30px 20px', borderRadius: '10px', textAlign: 'center' }}>
                <h2>{articulosPujados}</h2>
                <p>Artículos Pujados</p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

// Páginas hijas (rutas específicas del dashboard)
export const Perfil = () => <h2 style={{ color: 'white', padding: '20px' }}>Perfil del Usuario</h2>;
export const Pujas = () => <h2 style={{ color: 'white', padding: '20px' }}>Mis Pujas</h2>;
export const Pedidos = () => <h2 style={{ color: 'white', padding: '20px' }}>Mis Pedidos</h2>;
export const Ajustes = () => <h2 style={{ color: 'white', padding: '20px' }}>Ajustes</h2>;
export const Logout = () => <h2 style={{ color: 'white', padding: '20px' }}>Sesión Cerrada</h2>;

export default DashboardUsuario;


/*
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './DashboardUsuario.css';

const DashboardUsuario = () => {
  const [articulosGanados, setArticulosGanados] = useState(1);
  const [pujasRealizadas, setPujasRealizadas] = useState(1);
  const [articulosPujados, setArticulosPujados] = useState(1);

  return (
    <div
      style={{
        backgroundImage: 'url("/estadio-interior.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        color: 'white',
        position: 'relative'
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 0
      }}></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <header style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="Logo" style={{ height: '40px', marginRight: '10px' }} />
            <nav>
              <Link to="/en-vivo" style={{ marginRight: '15px', color: 'white', textDecoration: 'none' }}>En Vivo</Link>
              <Link to="/varonil" style={{ marginRight: '15px', color: 'white', textDecoration: 'none' }}>Varonil</Link>
              <Link to="/femenil" style={{ color: 'white', textDecoration: 'none' }}>Femenil</Link>
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" placeholder="Busca a un jugador o partido" style={{ padding: '5px 10px', borderRadius: '20px', border: 'none', marginRight: '10px' }} />
            <button style={{ background: 'transparent', border: 'none', color: 'white' }}>❤️</button>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#ccc', borderRadius: '50%' }}></div>
          </div>
        </header>

        <main style={{ padding: '20px' }}>
          <h1 style={{ marginBottom: '10px' }}>GONZALO ROJAS</h1>
          <hr style={{ marginBottom: '20px' }} />
          <div style={{ display: 'flex' }}>
            <aside style={{ width: '200px' }}>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '15px' }}><Link to="/dashboard/perfil" style={{ color: 'white', textDecoration: 'none' }}>Mi Perfil</Link></li>
                <li style={{ marginBottom: '15px' }}><Link to="/dashboard/pujas" style={{ color: 'white', textDecoration: 'none' }}>Mis Pujas</Link></li>
                <li style={{ marginBottom: '15px' }}><Link to="/dashboard/pedidos" style={{ color: 'white', textDecoration: 'none' }}>Mis Pedidos</Link></li>
                <li style={{ marginBottom: '15px' }}><Link to="/dashboard/ajustes" style={{ color: 'white', textDecoration: 'none' }}>Ajustes</Link></li>
                <li style={{ marginBottom: '15px' }}><Link to="/logout" style={{ color: 'white', textDecoration: 'none' }}>Cerrar sesión</Link></li>
              </ul>
            </aside>
            <section style={{ flexGrow: 1, display: 'flex', justifyContent: 'space-around', marginLeft: '20px', gap: '20px' }}>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '30px 20px', borderRadius: '10px', textAlign: 'center' }}>
                <h2>{articulosGanados}</h2>
                <p>Artículos Ganados</p>
              </div>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '30px 20px', borderRadius: '10px', textAlign: 'center' }}>
                <h2>{pujasRealizadas}</h2>
                <p>Total de Pujas Realizadas</p>
              </div>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '30px 20px', borderRadius: '10px', textAlign: 'center' }}>
                <h2>{articulosPujados}</h2>
                <p>Artículos Pujados</p>
              </div>
            </section>
          </div>
        </main>

      </div>
    </div>
  );
};

const Perfil = () => <h2 style={{ color: 'white', padding: '20px' }}>Perfil del Usuario</h2>;
const Pujas = () => <h2 style={{ color: 'white', padding: '20px' }}>Mis Pujas</h2>;
const Pedidos = () => <h2 style={{ color: 'white', padding: '20px' }}>Mis Pedidos</h2>;
const Ajustes = () => <h2 style={{ color: 'white', padding: '20px' }}>Ajustes</h2>;
const Logout = () => <h2 style={{ color: 'white', padding: '20px' }}>Sesión Cerrada</h2>;

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<DashboardUsuario />} />
        <Route path="/dashboard/perfil" element={<Perfil />} />
        <Route path="/dashboard/pujas" element={<Pujas />} />
        <Route path="/dashboard/pedidos" element={<Pedidos />} />
        <Route path="/dashboard/ajustes" element={<Ajustes />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/" element={<h1 style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Bienvenido a Subastas Chivas</h1>} />
      </Routes>
    </Router>
  );
};

export default App;
*/
//----------------------------------------------------------------------------------------------
/*
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CalendarSelector from './CalendarSelector';

const DashboardUsuario = () => {
  const [articulosGanados, setArticulosGanados] = useState(1);
  const [pujasRealizadas, setPujasRealizadas] = useState(1);
  const [articulosPujados, setArticulosPujados] = useState(1);

  return (
    <div
      style={{
        backgroundImage: 'url("/estadio-interior.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        color: 'white',
      }}
    >
      <header style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '40px', marginRight: '10px' }} />
          <nav>
            <Link to="/en-vivo" style={{ marginRight: '15px', color: 'white', textDecoration: 'none' }}>En Vivo</Link>
            <Link to="/varonil" style={{ marginRight: '15px', color: 'white', textDecoration: 'none' }}>Varonil</Link>
            <Link to="/femenil" style={{ color: 'white', textDecoration: 'none' }}>Femenil</Link>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input type="text" placeholder="Busca a un jugador o partido" style={{ padding: '5px 10px', borderRadius: '20px', border: 'none', marginRight: '10px' }} />
          <button style={{ background: 'transparent', border: 'none', color: 'white' }}>❤️</button>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#ccc', borderRadius: '50%' }}></div>
        </div>
      </header>

      <main style={{ padding: '20px' }}>
        <h1 style={{ marginBottom: '10px' }}>GONZALO ROJAS</h1>
        <hr style={{ marginBottom: '20px' }} />
        <div style={{ display: 'flex' }}>
          <aside style={{ width: '200px' }}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><Link to="/dashboard/perfil" style={{ color: 'white', textDecoration: 'none' }}>Mi Perfil</Link></li>
              <li><Link to="/dashboard/pujas" style={{ color: 'white', textDecoration: 'none' }}>Mis Pujas</Link></li>
              <li><Link to="/dashboard/pedidos" style={{ color: 'white', textDecoration: 'none' }}>Mis Pedidos</Link></li>
              <li><Link to="/dashboard/ajustes" style={{ color: 'white', textDecoration: 'none' }}>Ajustes</Link></li>
              <li><Link to="/logout" style={{ color: 'white', textDecoration: 'none' }}>Cerrar sesión</Link></li>
            </ul>
          </aside>
          <section style={{ flexGrow: 1, display: 'flex', justifyContent: 'space-around', marginLeft: '20px' }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
              <h2>{articulosGanados}</h2>
              <p>Artículos Ganados</p>
            </div>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
              <h2>{pujasRealizadas}</h2>
              <p>Total de Pujas Realizadas</p>
            </div>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
              <h2>{articulosPujados}</h2>
              <p>Artículos Pujados</p>
            </div>
          </section>
        </div>
      </main>

      
    </div>
  );
};

const Perfil = () => <h2 style={{ color: 'white', padding: '20px' }}>Perfil del Usuario</h2>;
const Pujas = () => <h2 style={{ color: 'white', padding: '20px' }}>Mis Pujas</h2>;
const Pedidos = () => <h2 style={{ color: 'white', padding: '20px' }}>Mis Pedidos</h2>;
const Ajustes = () => <h2 style={{ color: 'white', padding: '20px' }}>Ajustes</h2>;
const Logout = () => <h2 style={{ color: 'white', padding: '20px' }}>Sesión Cerrada</h2>;

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/calendar" element={<CalendarSelector />} />
        <Route path="/dashboard" element={<DashboardUsuario />} />
        <Route path="/dashboard/perfil" element={<Perfil />} />
        <Route path="/dashboard/pujas" element={<Pujas />} />
        <Route path="/dashboard/pedidos" element={<Pedidos />} />
        <Route path="/dashboard/ajustes" element={<Ajustes />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/" element={<h1 style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Bienvenido a Subastas Chivas</h1>} />
      </Routes>
    </Router>
  );
};

export default App;
*/

/*
import React from 'react';
import './DashboardUsuario.css';

const DashboardUsuario = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay">
        <div className="dashboard-header">
          <div className="user-info">
            <div className="user-photo"></div>
            <h2 className="user-name">GONZALO ROJAS</h2>
          </div>
        </div>

        <hr className="divider" />

        <div className="dashboard-content">
          <div className="dashboard-menu">
            <ul>
              <li className="active">Mi Perfil</li>
              <li>Mis Pujas</li>
              <li>Mis Pedidos</li>
              <li>Ajustes</li>
              <li>Cerrar sesión</li>
            </ul>
          </div>

          <div className="dashboard-stats">
            <div className="stat-box">
              <h3>1</h3>
              <p>Artículos Ganados</p>
            </div>
            <div className="stat-box">
              <h3>1</h3>
              <p>Total de Pujas Realizadas</p>
            </div>
            <div className="stat-box">
              <h3>1</h3>
              <p>Artículos Pujados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardUsuario;
*/