import React from 'react';
import { Link } from 'react-router-dom';

const DashboardAside = ({ handleLogout }) => {
  return (
    <aside className="dashboard-aside">
      <ul>
        <li><Link to="/dashboardUsuario">Mi Perfil</Link></li>
        <li><Link to="/dashboardUsuario/MisPujas">Mis Pujas</Link></li>
        <li><Link to="/dashboardUsuario/pedidos">Mis Pedidos</Link></li>
        <li><Link to="/dashboardUsuario/ajustes">Ajustes</Link></li>
        <li className="dashboard-logout" onClick={handleLogout}>Cerrar sesión</li>
      </ul>
    </aside>
  );
};

export default DashboardAside;