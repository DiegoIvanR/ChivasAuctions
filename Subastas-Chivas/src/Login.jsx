// src/Login.jsx
import React, { useState } from 'react';
import { login as loginAction } from './authSlice';
import { supabase } from './supabaseClient';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

function Welcome() {
    const user = useSelector((state) => state.auth.user); // Assuming user is stored in Redux state
    const navigate = useNavigate();
  
    const handleGoHome = () => {
      navigate('/');
    };
  
    return (
      <div className="welcome-container">
        <h1 className="welcome-title">Bienvenido {user?.full_name || 'Usuario'}</h1>
        <button className="welcome-button" onClick={handleGoHome}>
          Ir a la página principal
        </button>
      </div>
    );
  }

export default function Login() {
  // Local component state
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading]       = useState(false);

  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // Handler for form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic front-end validation
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      // 1) Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        // Typical errors: invalid credentials, email not confirmed, etc.
        setErrorMessage(authError.message);
        setLoading(false);
        return;
      }

      if (!authData || !authData.user || !authData.session) {
        setErrorMessage('Unexpected auth response. Please try again.');
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      // 2) Fetch user's profile row from "profiles" table
      let profile = null;
      try {
        console.log('auction data incoming...');
        const { data: auctionData, error } = await supabase
                  .from('jerseys')
                  .select('*');
        console.log('Auction Data:', auctionData);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, role, username, avatar_url') // only select what you need
          .eq('id', userId)
          .single();

        if (profileError) {
          console.warn('[Login] Could not fetch profile:', profileError.message);
          // You can choose to bail here or fall back to a minimal default profile
          // For this example, we'll fall back:
          profile = {
            id: userId,
            full_name: null,
            role: 'bidder',
            username: null,
            avatar_url: null,
          };
        } else {
          profile = {
            id: profileData.id,
            full_name: profileData.full_name,
            role: profileData.role,
            username: profileData.username,
            avatar_url: profileData.avatar_url,
          };
        }
      } catch (err) {
        console.error('[Login] Unexpected error fetching profile:', err);
        profile = {
          id: userId,
          full_name: null,
          role: 'bidder',
          username: null,
          avatar_url: null,
        };
      }

      // 3) Combine user + profile + session into a single object
      const userPayload = {
        id: authData.user.id,
        email: authData.user.email,
        email_confirmed: !!authData.user.confirmed_at,
        role: authData.user.role,
        avatar_url: profile.avatar_url,
        full_name: profile.full_name,
        username: profile.username,
        profile_role: profile.role,
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at,
        },
      };

      // 4) Dispatch to Redux (this also writes to localStorage)
      dispatch(loginAction(userPayload));

      // 5) Optional: navigate to dashboard or reload UI
      // For example, if you have react-router:
      // navigate('/dashboard');

      alert('Login successful!');
    } catch (unexpectedErr) {
      console.error('[Login] Unexpected error:', unexpectedErr);
      setErrorMessage('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login-container">
    {!user && (
        <div className='login-form-container'>
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
            {errorMessage && (
            <div className="login-error">{errorMessage}</div>
            )}

            {/* Submit Button */}
            <button
            type="submit"
            className="login-button"
            disabled={loading}
            >
            {loading ? 'Signing In…' : 'Sign In'}
            </button>
        </form>
      </div>)}
    {user && <Welcome />}
    </div>
  );
}
