import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from './authSlice';
import { supabase } from './supabaseClient';
import './Confirmation.css';

export default function Confirmation() {
    const [status, setStatus] = useState('Verifying...');
    const dispatch = useDispatch();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const email = queryParams.get('email');
        const password = queryParams.get('password');

        if (!email || !password) {
            setStatus('Invalid confirmation link.');
            return;
        }

        const verifyAndLogin = async () => {
            try {
                // Log in the user with the provided credentials
                const { data: session, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    setStatus('Failed to verify email. Please try again.');
                } else {
                    // Fetch user profile data from public.profiles
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profileError) {
                        console.error('Error fetching profile:', profileError.message);
                        setStatus('Email verified, but failed to fetch profile.');
                    } else {
                        // Dispatch login action with user and profile data
                        const userData = {
                            ...session.user,
                            username: profile.username || 'default.username',
                            full_name: profile.full_name || 'default.full_name',
                        };

                        dispatch(login(userData));
                        setStatus('Email verified successfully!');
                        console.log('User logged in:', userData);
                    }
                }
            } catch (err) {
                console.error('Unexpected error:', err);
                setStatus('An unexpected error occurred.');
            }
        };

        verifyAndLogin();
    }, [dispatch]);

    return (
        <div className="confirmation-container">
            <h2>Email Confirmation</h2>
            <p>{status}</p>
            {status === 'Email verified successfully!' && (
                <a href="http://localhost:5137/">Go to Homepage</a>
            )}
        </div>
    );
}