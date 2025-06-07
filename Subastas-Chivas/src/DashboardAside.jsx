import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
const DashboardAside = ({ handleLogout }) => {

  const { user } = useSelector((state) => state.auth);
  return (
    <aside className="dashboard-aside">
      <ul>
        <li><Link to="/dashboardUsuario">Mi Perfil</Link></li>
        <li><Link to="/dashboardUsuario/MisPujas">Mis Pujas</Link></li>
        <li><Link to="/dashboardUsuario/MisPedidos">Mis Pedidos</Link></li>
        {user.role === "admin" && (
            <li><Link to="/dashboard">Admin Dashboard</Link></li>
          )}
        <li><Link to="/dashboardUsuario/ajustes">Ajustes</Link></li>
        <li className="dashboard-logout" onClick={handleLogout}>Cerrar sesión</li>
      </ul>
    </aside>
  );
};

export default DashboardAside;