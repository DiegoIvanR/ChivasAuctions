import React, { useState, useEffect } from 'react';
import './MisPujas.css';
import { useSelector } from 'react-redux';
import DashboardAside from './DashboardAside';
import JerseyCard from './JerseyCard'; // Import the JerseyCard component
import { supabase } from './supabaseClient'; // Import Supabase client
import AddCardForm from './AddCardForm'; // Import the AddCardForm component
import DashboardHeader from './DashboardHeader'
const Ajustes = () => {
  const user = useSelector((state) => state.auth.user); // Assuming user is stored in Redux state

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-overlay"></div>
      <div className="dashboard-content animate-fade-in">
        <main className="dashboard-main">
          <DashboardHeader name={user.full_name}/>
          <div className="dashboard-body">
            <DashboardAside />
          <AddCardForm bidBanner={true}/>
          </div>
          
        </main>
      </div>
    </div>
  );
};

export default Ajustes;