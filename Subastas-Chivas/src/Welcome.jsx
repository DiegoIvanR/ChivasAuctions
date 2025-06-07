import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
export default function Welcome() {
    const user = useSelector((state) => state.auth.user); // Assuming user is stored in Redux state
    const navigate = useNavigate();
  
    const handleGoHome = () => {
      navigate('/');
    };
  
    return (

    <div className='login-container-wrapper'>
    <img src='../public/stadium-image.png' className='stadium-image' />
    <div className="login-form-container">
        <h1 className="welcome-title">Bienvenido, {user?.full_name || 'Usuario'}</h1>
        <button className="welcome-button" onClick={handleGoHome}>
          Ir a la página principal
        </button>
      </div>
    </div>

    );
  }
