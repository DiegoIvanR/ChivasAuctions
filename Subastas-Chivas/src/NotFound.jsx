import React from 'react';
import { Link } from 'react-router-dom';
import './not-found.css'; // Import your CSS for styling
const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1 className='not-found-title'>404 - Página no encontrada</h1>
      <p className='not-found-message'>Lo sentimos, la página que estás buscando no existe.</p>
      <Link to="/" className="not-found-link">
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFound;