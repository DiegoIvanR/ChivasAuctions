import React, { useState } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import './DashboardUsuario.css';

const DashboardUsuario = () => {
  const [articulosGanados, setArticulosGanados] = useState(1);
  const [pujasRealizadas, setPujasRealizadas] = useState(1);
  const [articulosPujados, setArticulosPujados] = useState(1);
  const user = useSelector((state) => state.auth.user); // Assuming user is stored in Redux state

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
          <h1 className="dashboard-title">{user.full_name}</h1>
          <hr className="dashboard-divider" />
          <div className="dashboard-body">
            <aside className="dashboard-aside">
              <ul>
                <li><Link to="/dashboardUsuario">Mi Perfil</Link></li>
                <li><Link to="/dashboardUsuario/MisPujas">Mis Pujas</Link></li>
                <li><Link to="/dashboardUsuario/pedidos">Mis Pedidos</Link></li>
                <li><Link to="/dashboardUsuario/ajustes">Ajustes</Link></li>
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