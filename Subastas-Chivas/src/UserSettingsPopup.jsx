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
  }
  const handleMisPujas = () => {
    onClose(); // Close the popup
    navigate("/dashboardUsuario/MisPujas"); // Navigate to the user dashboard
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
          <li className="popup-menu-item">Mis Pedidos</li>
          <li className="popup-menu-item">Ajustes</li>
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