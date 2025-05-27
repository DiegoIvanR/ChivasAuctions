import React from "react";
import "./user-settings-popup.css";

export default function UserSettingsPopup({ onClose }) {
    return (
        <div className="user-settings-popup">
            <button className="popup-close" onClick={onClose}>✖</button>
            <ul className="popup-menu">
                <li className="popup-menu-item">Cuenta</li>
                <li className="popup-menu-item">Mi Perfil</li>
                <li className="popup-menu-item">Mis Pedidos</li>
                <li className="popup-menu-item">Ajustes</li>
                <li className="popup-menu-item">Cerrar Sesión</li>
            </ul>
        </div>
    );
}