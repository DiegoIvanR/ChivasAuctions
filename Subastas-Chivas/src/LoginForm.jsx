import React from 'react';
import './Login.css';

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  errorMessage,
  loading,
  handleLogin,
}) {
  return (
    <div className='login-container-wrapper'>
      <img src='../stadium-image.png' className='stadium-image' />
      <div className="login-form-container">
        <h2 className="login-title">SUBASTAS CHIVAS</h2>

        <form onSubmit={handleLogin} className="login-form">
          {/* Email Field */}
          <div className="login-field">
            <input
              id="email"
              type="email"
              placeholder="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div className="login-field">
            <input
              id="password"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {errorMessage && <div className="login-error">{errorMessage}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN'}
          </button>
        </form>
      </div>
    </div>
  );
}