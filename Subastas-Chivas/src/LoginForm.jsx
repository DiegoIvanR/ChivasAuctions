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
    <div className="login-form-container">
      <h2 className="login-title">Sign In</h2>

      <form onSubmit={handleLogin} className="login-form">
        {/* Email Field */}
        <div className="login-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Password Field */}
        <div className="login-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
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
          {loading ? 'Signing In…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}