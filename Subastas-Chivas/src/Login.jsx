import React, { useState } from 'react';
import { login as loginAction } from './authSlice';
import { supabase } from './supabaseClient';
import './Login.css';
import { useSelector, useDispatch } from 'react-redux';
import Welcome from './Welcome';
import LoginForm from './LoginForm'; // Import the new LoginForm component

export default function Login() {
  // Local component state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
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

      let profile = null;
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, role, username, avatar_url')
          .eq('id', userId)
          .single();

        if (profileError) {
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
        profile = {
          id: userId,
          full_name: null,
          role: 'bidder',
          username: null,
          avatar_url: null,
        };
      }

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

      dispatch(loginAction(userPayload));
      alert('Login successful!');
    } catch (unexpectedErr) {
      setErrorMessage('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {!user && (
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          errorMessage={errorMessage}
          loading={loading}
          handleLogin={handleLogin}
        />
      )}
      {user && <Welcome />}
    </div>
  );
}