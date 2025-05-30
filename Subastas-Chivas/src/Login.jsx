import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from './authSlice';
import { supabase } from './supabaseClient';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const dispatch = useDispatch();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
    
        try {
            const { data: session, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
    
            if (error) {
                setError(error.message);
            } else {
                // Fetch additional user profile data from public.profiles
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
    
                if (profileError) {
                    console.error('Error fetching profile:', profileError.message);
                    setError('Failed to fetch user profile.');
                } else {
                    // Combine session user data with profile data
                    const userData = {
                        ...session.user,
                        profile,
                    };
    
                    dispatch(login(userData)); // Dispatch login action with combined user data
                    alert('Login successful!');
                }
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setError('An unexpected error occurred.');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit">Login</button>
            </form>
        </div>
    );
}