import React, { useState, useEffect } from 'react';
import './MisPujas.css';
import { useSelector } from 'react-redux';
import DashboardAside from './DashboardAside';
import JerseyCard from './JerseyCard'; // Import the JerseyCard component
import { supabase } from './supabaseClient'; // Import Supabase client
import DashboardHeader from './DashboardHeader';
const MisPujas = () => {
  const user = useSelector((state) => state.auth.user); // Assuming user is stored in Redux state
  const [pujas, setPujas] = useState([]); // State to store fetched jerseys
  const [filter, setFilter] = useState('EN VIVO'); // State to track the active filter

  useEffect(() => {
    const fetchPujas = async () => {
      try {
        let query = supabase
          .from('bids')
          .select(`
            auction_id,
            auctions (
              jersey_id,
              start_time,
              end_time,
              highest_bid,
              jerseys (
                player_name,
                jersey_number,
                image_url,
                used,
                signed
              )
            )
          `)
          .eq('bidder_id', user.id); // Filter by the logged-in user's bids

        const now = new Date().toISOString(); // Format the current date as ISO string
        if (filter === 'EN VIVO') {
          query = query
            .gte('auctions.end_time', now); // Use `lte` for `<=`
        } else if (filter === 'CERRADAS') {
          query = query.lt('auctions.end_time', now); // Use `lt` for `<`
        } else if (filter === 'GANADAS') {
          query = await supabase // Assuming there's a winner_id field in auctions
            .from('payments')
            .select(`
              payment_id,
              auction_id,
              bidder_id,
              auctions (
                jersey_id,
                start_time,
                end_time,
                highest_bid,
                jerseys (
                  player_name,
                  jersey_number,
                  image_url,
                  used,
                  signed
                )
              ) 
            `)
            .eq('bidder_id', user.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching pujas:', error.message);
          return;
        }

        // Ensure unique auction_ids by using a Map
        const uniqueAuctions = new Map();
        data.forEach((bid) => {
          if (bid.auctions && !uniqueAuctions.has(bid.auction_id)) {
            uniqueAuctions.set(bid.auction_id, bid); // Store the original bid object
          }
        });

        // Convert the Map values to an array
        setPujas(Array.from(uniqueAuctions.values()));
      } catch (err) {
        console.error('Unexpected error fetching pujas:', err);
      }
    };

    fetchPujas();
  }, [filter, user]);

  const handleClick = () => {
    if (locker.auctions?.auction_id) {
      navigate(`/auction/${locker.auctions.auction_id}`);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-overlay"></div>
      <div className="dashboard-content animate-fade-in">
        
        <main className="dashboard-main">
        <DashboardHeader name={user.full_name}/>
          <div className="dashboard-body dashboard-body--pujas">
            <DashboardAside />  
            <div className='mispujas-body-content'>
              <div className="mispujas-filters">
              <button
                className={filter === 'EN VIVO' ? 'active' : ''}
                onClick={() => setFilter('EN VIVO')}
              >
                EN VIVO
              </button>
              <button
                className={filter === 'CERRADAS' ? 'active' : ''}
                onClick={() => setFilter('CERRADAS')}
              >
                CERRADAS
              </button>
              <button
                className={filter === 'GANADAS' ? 'active' : ''}
                onClick={() => setFilter('GANADAS')}
              >
                GANADAS
              </button>
            </div>

              <section className="dashboard-section--pujas">
                {pujas.length === 0 ? (
                  <p>No hay pujas disponibles para este filtro.</p>
                ) : (
                  <div className="dashboard-pujas">
                    {pujas.map((jersey) => (
                      <JerseyCard key={jersey.auction_id} jersey={jersey} filter={filter}/>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MisPujas;