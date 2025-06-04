import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import './DashboardUsuario.css';
import { logout } from "./authSlice";
import StatCard from './StatCard'; // Import the StatCard component
import { supabase } from './supabaseClient'; // Import Supabase client
import DashboardAside from './DashboardAside';

const DashboardUsuario = () => {
  const [articulosGanados, setArticulosGanados] = useState(0);
  const [pujasRealizadas, setPujasRealizadas] = useState(0);
  const [articulosPujados, setArticulosPujados] = useState(0);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;

      try {
        // Fetch both bid_id and auction_id in a single request
        const { data: bidsData, error: bidsError } = await supabase
          .from('bids')
          .select('bid_id, auction_id')
          .eq('bidder_id', user.id);
      
        if (bidsError) {
          console.error('Error fetching bids:', bidsError.message);
        } else {
          // Total number of bids
          setPujasRealizadas(bidsData.length);
      
          // Count unique auction_ids
          const uniqueAuctionIds = new Set(bidsData.map(bid => bid.auction_id));
          setArticulosPujados(uniqueAuctionIds.size);
        }

        const { data: wonItemsData, error: wonItemsError } = await supabase
          .from('payments')
          .select('bidder_id')
          .eq('bidder_id', user.id);
        if (wonItemsError) {
          console.error('Error fetching won items:', wonItemsError.message);
        } else {
          // Count the number of won items
          setArticulosGanados(wonItemsData.length);
        }
      } catch (err) {
        console.error('Unexpected error fetching user stats:', err);
      }
    };

    fetchUserStats();
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-overlay"></div>

      <div className="dashboard-content animate-fade-in">
        <div className="dashboard-buffer" style={{ height: '80px' }}></div>

        <main className="dashboard-main">
          <h1 className="dashboard-title">{user?.full_name}</h1>
          <hr className="dashboard-divider" />
          <div className="dashboard-body">
            <DashboardAside />
            <section className="dashboard-section">
              <StatCard title="Artículos Ganados" value={articulosGanados} />
              <StatCard title="Total de Pujas Realizadas" value={pujasRealizadas} />
              <StatCard title="Artículos Pujados" value={articulosPujados} />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardUsuario;