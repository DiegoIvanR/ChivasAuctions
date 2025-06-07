import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import './Login.css'; // Use Login.css for styling

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRewrite, setPasswordRewrite] = useState('');
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (password !== passwordRewrite) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const { data: session, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) {
                setError(authError.message);
            } else {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: fullName,
                        username: username,
                    })
                    .eq('id', session.user.id);

                if (profileError) {
                    console.error('Error updating profile:', profileError.message);
                    setError('Failed to update user profile.');
                } else {
                    setSuccess('Sign up successful! Your profile has been updated.');
                }
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setError('An unexpected error occurred.');
        }
    };

    return (
        <div className="login-container">
        <div className="login-container-wrapper">
            <img src="../public/stadium-image.png" className="stadium-image" />
            <div className="login-form-container">
                <h2 className="login-title">SUBASTAS CHIVAS</h2>
                <form onSubmit={handleSignUp} className="login-form">
                    <div className="login-field">
                        <label>Correo Electrónico:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="login-field">
                        <label>Contraseña:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="login-field">
                        <label>Reescribe la Contraseña:</label>
                        <input
                            type="password"
                            value={passwordRewrite}
                            onChange={(e) => setPasswordRewrite(e.target.value)}
                            required
                        />
                    </div>
                    <div className="login-field">
                        <label>Nombre Completo:</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="login-field">
                        <label>Username:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="login-error">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                    <button type="submit" className="login-button">
                        REGISTRARSE
                    </button>
                </form>
            </div>
        </div>
        </div>
    );
}