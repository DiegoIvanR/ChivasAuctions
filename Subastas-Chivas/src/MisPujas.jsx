import React from 'react';
import { jerseys } from './jerseys';
import './MisPujas.css';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import DashboardAside from './DashboardAside';

const MisPujas = () => {
  const pujasGanadas = jerseys.slice(0, 1); // temporal hasta que filtres las reales
  const user = useSelector((state) => state.auth.user); // Assuming user is stored in Redux state

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-overlay"></div>
      <div className="dashboard-content animate-fade-in">

        <div className="dashboard-buffer" style={{ height: '80px' }}></div>

        <main className="dashboard-main">
          <h1 className="dashboard-title">{user.full_name}</h1>
          <hr className="dashboard-divider" />

          <div className="mispujas-filters">
            <button>EN VIVO</button>
            <button>CERRADAS</button>
            <button className="active">GANADAS</button>
          </div>

          <div className="dashboard-body">
            <DashboardAside/>

            <section className="dashboard-section">
              {pujasGanadas.map(jersey => (
                <div className="stat-card jersey-card animate-pop-in" key={jersey.id}>
                  <img
                    src={jersey.img_src.replace('../public', '')}
                    alt={jersey.player}
                    className="jersey-image"
                  />
                  <div className="jersey-info">
                    <h3>{jersey.player}</h3>
                    <p>PUJA GANADORA</p>
                    <p className="price">${jersey.highest_bid}</p>
                    <div className="tags">
                      {jersey.used && <span className="tag">USADA</span>}
                      {jersey.signed && <span className="tag">FIRMADA</span>}
                    </div>
                    <p className="estado">Terminado</p>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MisPujas;