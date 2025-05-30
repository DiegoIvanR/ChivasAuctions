import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import './SignUp.css';

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
            // Create user in Supabase authentication
            const { data: session, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });
    
            if (authError) {
                setError(authError.message);
            } else {
                // Update user profile in public.profiles table
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: fullName,
                        username: username,
                    })
                    .eq('id', session.user.id); // Match the profile by user ID
    
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
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSignUp}>
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
                <div>
                    <label>Rewrite Password:</label>
                    <input
                        type="password"
                        value={passwordRewrite}
                        onChange={(e) => setPasswordRewrite(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Full Name:</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}