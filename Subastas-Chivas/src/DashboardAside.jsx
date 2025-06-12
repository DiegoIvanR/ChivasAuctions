import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import {logout} from "./authSlice"
import { useNavigate } from "react-router-dom"; // Use useNavigate instead of Navigate

const DashboardAside = () => {

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize useNavigate
  
  const handleLogout = () => {
      dispatch(logout()); // Dispatch logout action
      navigate("/"); // Navigate to the homepage after logout
    };

  return (
    <aside className="dashboard-aside">
      <ul>
        <li><Link to="/dashboardUsuario">Mi Perfil</Link></li>
        <li><Link to="/dashboardUsuario/MisPujas">Mis Pujas</Link></li>
        <li><Link to="/dashboardUsuario/MisPedidos">Mis Pedidos</Link></li>
        {user.role === "admin" && (
          <ul>
            <li><Link to="/dashboard">Crear Subasta</Link></li>
            <li><Link to="/admin-dashboard">Admin Dashboard</Link></li>
          </ul>
          )}
        <li><Link to="/dashboardUsuario/ajustes">Ajustes</Link></li>
        <li className="dashboard-logout" onClick={handleLogout}>Cerrar sesión</li>
      </ul>
    </aside>
  );
};

export default DashboardAside;