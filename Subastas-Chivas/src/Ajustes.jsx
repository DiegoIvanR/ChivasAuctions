import React, { useState, useEffect } from 'react';
import './MisPujas.css';
import { useSelector } from 'react-redux';
import DashboardAside from './DashboardAside';
import JerseyCard from './JerseyCard'; // Import the JerseyCard component
import { supabase } from './supabaseClient'; // Import Supabase client
import AddCardForm from './AddCardForm'; // Import the AddCardForm component
const Ajustes = () => {
  const user = useSelector((state) => state.auth.user); // Assuming user is stored in Redux state

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-overlay"></div>
      <div className="dashboard-content animate-fade-in">

        <div className="dashboard-buffer" style={{ height: '80px' }}></div>

        <main className="dashboard-main">
          <h1 className="dashboard-title">{user.full_name}</h1>
          <hr className="dashboard-divider" />
          <div className="dashboard-body">
            <DashboardAside />
          <AddCardForm />
          </div>
          
        </main>
      </div>
    </div>
  );
};

export default Ajustes;