import React, { useState } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import './DashboardUsuario.css';

const DashboardUsuario = () => {
  const [articulosGanados, setArticulosGanados] = useState(1);
  const [pujasRealizadas, setPujasRealizadas] = useState(1);
  const [articulosPujados, setArticulosPujados] = useState(1);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-overlay"></div>

      <div className="dashboard-content animate-fade-in">
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <img src="/logo.png" alt="Logo" className="dashboard-logo" />
            <nav className="dashboard-nav">
              <Link to="/en-vivo">En Vivo</Link>
              <Link to="/varonil">Varonil</Link>
              <Link to="/femenil">Femenil</Link>
            </nav>
          </div>
          <div className="dashboard-header-right">
            <input type="text" placeholder="Busca a un jugador o partido" className="dashboard-search" />
            /*
            <button className="dashboard-heart">❤️</button>
            */
            <div className="dashboard-avatar"></div>
          </div>
        </header>

        <div className="dashboard-buffer" style={{ height: '80px' }}></div>

        <main className="dashboard-main">
          <h1 className="dashboard-title">GONZALO ROJAS</h1>
          <hr className="dashboard-divider" />
          <div className="dashboard-body">
            <aside className="dashboard-aside">
              <ul>
                <li><Link to="/dashboard/perfil">Mi Perfil</Link></li>
                <li><Link to="/dashboard/pujas">Mis Pujas</Link></li>
                <li><Link to="/dashboard/pedidos">Mis Pedidos</Link></li>
                <li><Link to="/dashboard/ajustes">Ajustes</Link></li>
                <li><Link to="/logout">Cerrar sesión</Link></li>
              </ul>
            </aside>
            <section className="dashboard-section">
              <div className="stat-card animate-pop-in">
                <h2>{articulosGanados}</h2>
                <p>Artículos Ganados</p>
              </div>
              <div className="stat-card animate-pop-in">
                <h2>{pujasRealizadas}</h2>
                <p>Total de Pujas Realizadas</p>
              </div>
              <div className="stat-card animate-pop-in">
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

export const Perfil = () => <h2 className="dashboard-subpage animate-fade-in">Perfil del Usuario</h2>;
export const Pujas = () => <h2 className="dashboard-subpage animate-fade-in">Mis Pujas</h2>;
export const Pedidos = () => <h2 className="dashboard-subpage animate-fade-in">Mis Pedidos</h2>;
export const Ajustes = () => <h2 className="dashboard-subpage animate-fade-in">Ajustes</h2>;
export const Logout = () => <h2 className="dashboard-subpage animate-fade-in">Sesión Cerrada</h2>;

export default DashboardUsuario;



/*
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
*/