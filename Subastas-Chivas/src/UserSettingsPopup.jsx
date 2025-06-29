import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Use useNavigate instead of Navigate
import { logout } from "./authSlice";
import "./user-settings-popup.css";

export default function UserSettingsPopup({ onClose }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogout = () => {
    dispatch(logout()); // Dispatch logout action
    onClose(); // Close the popup
    navigate("/"); // Navigate to the homepage after logout
  };

  const handleLogIn = () => {
    onClose(); // Close the popup
    navigate("/login"); // Navigate to the login page
  };

  const handleSignUp = () => {
    onClose(); // Close the popup
    navigate("/signup"); // Navigate to the signup page
  };

  const handleUsuarioDashboard = () => {
    onClose(); // Close the popup
    navigate("/dashboardUsuario"); // Navigate to the user dashboard
  };

  const handleMisPujas = () => {
    onClose(); // Close the popup
    navigate("/dashboardUsuario/MisPujas"); // Navigate to the user's bids
  };

  const handleMisPedidos = () => {
    onClose(); // Close the popup
    navigate("/dashboardUsuario/MisPedidos"); // Navigate to the user's orders
  };

  const handleAdminDashboard = () => {
    onClose(); // Close the popup
    navigate("/admin-dashboard"); // Navigate to the admin dashboard
  };

  const handleNewAuction = () => {
    onClose(); // Close the popup
    navigate("/dashboard"); // Navigate to the admin dashboard
  }

  const handleSettings = () => {
    onClose(); // Close the popup
    navigate("/dashboardUsuario/ajustes"); // Navigate to the admin dashboard
  }


  return (
    <div className="user-settings-popup">
      <button className="popup-close" onClick={onClose}>
        <p className="popup-close-x">✖</p>
      </button>
      {user && (
        <ul className="popup-menu">
          <li className="popup-menu-item" onClick={handleUsuarioDashboard}>Mi Perfil</li>
          <li className="popup-menu-item" onClick={handleMisPujas}>Mis Pujas</li>
          <li className="popup-menu-item" onClick={handleMisPedidos}>Mis Pedidos</li>
          {user.role === "admin" && (
            <div>
              <li className="popup-menu-item" onClick={handleNewAuction}>Crear Subasta</li>
              <li className="popup-menu-item" onClick={handleAdminDashboard}>Admin Dashboard</li>
            </div>
          )}
          <li className="popup-menu-item" onClick={handleSettings}>Ajustes</li>
          <li className="popup-menu-item" onClick={handleLogout}>Cerrar Sesión</li>
        </ul>
      )}
      {!user && (
        <ul className="popup-menu">
          <li className="popup-menu-item" onClick={handleLogIn}>Iniciar Sesión</li>
          <li className="popup-menu-item" onClick={handleSignUp}>Registrarse</li>
        </ul>
      )}
    </div>
  );
}