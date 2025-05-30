import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null, // Rehydrate user from localStorage
    isAuthenticated: !!localStorage.getItem('user'), // Check if user exists in localStorage
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action) {
            state.user = {
                ...action.payload,
                username: action.payload.username || 'default.username',
                full_name: action.payload.full_name || 'default.full_name',
            };
            state.isAuthenticated = true;
            localStorage.setItem('user', JSON.stringify(state.user)); // Save user to localStorage
        },
        logout(state) {
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem('user'); // Remove user from localStorage
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;