import React from 'react';
import { jerseys } from './jerseys';
import './MisPujas.css';
import { useSelector } from 'react-redux';
import DashboardAside from './DashboardAside';
import JerseyCard from './JerseyCard'; // Import the JerseyCard component

const MisPujas = () => {
  const pujasGanadas = jerseys.slice(0, 1); // Temporal until you filter the real ones
  const user = useSelector((state) => state.auth.user); // Assuming user is stored in Redux state

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
            <DashboardAside />

            <section className="dashboard-section">
              {pujasGanadas.map(jersey => (
                <JerseyCard key={jersey.id} jersey={jersey} />
              ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MisPujas;