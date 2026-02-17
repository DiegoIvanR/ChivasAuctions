import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Locker from './Locker.jsx';
import ArrowButton from './ArrowButton';
import { supabase } from './supabaseClient';

export default function LockerRoomSearch() {
  const location = useLocation();
  const [filteredLockers, setFilteredLockers] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [visibleLockers, setVisibleLockers] = useState(7);
  const [noResults, setNoResults] = useState(false);
  const lockerWidth = 200;
  const pattern = new URLSearchParams(location.search).get('query') || '';

  // Responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1400) setVisibleLockers(7);
      else if (width >= 1200) setVisibleLockers(6);
      else if (width >= 992) setVisibleLockers(5);
      else if (width >= 768) setVisibleLockers(4);
      else if (width >= 576) setVisibleLockers(3);
      else setVisibleLockers(2);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Adjust scroll index when filtered lockers or visible count change
  useEffect(() => {
    if (filteredLockers.length === 0) {
      setStartIndex(0);
      return;
    }
    const maxStart = Math.max(0, filteredLockers.length - visibleLockers);
    if (startIndex > maxStart) {
      setStartIndex(maxStart);
    }
  }, [visibleLockers, filteredLockers.length, startIndex]);

  // Fetch data when location.search changes (reacts to URL param updates)
  useEffect(() => {
    const fetchLockers = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const matchId = queryParams.get('match_id');
        const searchQuery = queryParams.get('query') || '';
        let results = [];

        if (matchId) {
          const { data, error } = await supabase
            .from('jerseys')
            .select(`
              jersey_id,
              match_id,
              player_name,
              jersey_number,
              size,
              image_url,
              signed,
              used,
              auctions (
                auction_id,
                auction_status,
                start_time,
                end_time,
                highest_bid
              ),
              matches (
                opponent,
                venue,
                competition,
                match_date
              )
            `)
            .eq('match_id', matchId);

          if (error) throw error;
          results = data || [];
        } else if (searchQuery) {
          const pattern = `%${searchQuery}%`;

          const { data: byName, error: err1 } = await supabase
            .from('jerseys')
            .select(`
              jersey_id,
              match_id,
              player_name,
              jersey_number,
              size,
              image_url,
              used,
              signed,
              auctions (
                auction_id,
                auction_status,
                start_time,
                end_time,
                highest_bid
              ),
              matches (
                opponent,
                venue,
                competition,
                match_date
              )
            `)
            .ilike('player_name', pattern);

          if (err1) throw err1;

          const { data: byOpponent, error: err2 } = await supabase
            .from('jerseys')
            .select(`
              jersey_id,
              match_id,
              player_name,
              jersey_number,
              size,
              image_url,
              used,
              signed,
              auctions (
                auction_id,
                auction_status,
                start_time,
                end_time,
                highest_bid
              ),
              matches!inner (
                opponent,
                venue,
                competition,
                match_date
              )
            `)
            .ilike('matches.opponent', pattern);

          if (err2) throw err2;

          const combined = [...(byName || []), ...(byOpponent || [])];
          const dedupedMap = new Map();
          combined.forEach(row => {
            if (!dedupedMap.has(row.jersey_id)) {
              dedupedMap.set(row.jersey_id, row);
            }
          });
          results = Array.from(dedupedMap.values());
        } else {
          const { data, error } = await supabase
            .from('jerseys')
            .select(`
              jersey_id,
              match_id,
              player_name,
              jersey_number,
              size,
              image_url,
              used,
              signed,
              auctions (
                auction_id,
                auction_status,
                start_time,
                end_time,
                highest_bid
              ),
              matches (
                opponent,
                venue,
                competition,
                match_date
              )
            `);
          if (error) throw error;
          results = data || [];
        }

        const processed = results.map(locker => {
          locker.auctions = Array.isArray(locker.auctions) ? locker.auctions[0] || null : null;
          return locker;
        });

        setNoResults(processed.length === 0);

        const nPadding = Math.max(0, visibleLockers - processed.length);
        const leftPads = Math.floor(nPadding / 2);
        const rightPads = nPadding - leftPads;

        const paddedLockers = [
          ...Array(leftPads).fill({ jersey_id: null, player_name: '', match_id: '', auctions: null, matches: {} }),
          ...processed,
          ...Array(rightPads).fill({ jersey_id: null, player_name: '', match_id: '', auctions: null, matches: {} }),
        ];

        setFilteredLockers(paddedLockers);
      } catch (err) {
        console.error('Failed to fetch lockers:', err.message);
      }
    };

    fetchLockers();
  }, [location.search, visibleLockers]);

  // Carousel navigation
  const handlePrev = () => {
    if (startIndex > 0) setStartIndex(startIndex - 1);
  };

  const handleNext = () => {
    if (startIndex < filteredLockers.length - visibleLockers) setStartIndex(startIndex + 1);
  };

  return (
    <div className="locker-room-container"> 
      <div className='top-locker-frame-wrapper'>
        <img src="../top-locker-frame.png" className="top-door-frame" alt="Top locker frame" />
        <div className="no-results-banner">
        <div className="no-results-text">
          {noResults
            ? `0 RESULTADOS PARA '${pattern}'`
            : pattern
              ? `Mostrando resultados para '${pattern}'`
              : ''}
        </div>

          </div>
      </div>
      
        <div className="carousel-container">
          <div className="carousel-controls">
          
          
            <div
              className="locker-list"
              style={{
                transform: `translateX(calc(50% - ${lockerWidth * visibleLockers / 2}px + ${-startIndex * lockerWidth}px))`,
                width: `${filteredLockers.length * lockerWidth}px`,
              }}
            >
              {filteredLockers.map((locker, index) => (
                <div key={locker.jersey_id || `placeholder-${index}`} className="locker-wrapper">
                  <Locker locker={locker} />
                </div>
              ))}
            </div>
            <div className="arrow-buttons">
              <ArrowButton direction="left" onClick={handlePrev} disabled={startIndex === 0} />
              <ArrowButton direction="right" onClick={handleNext} disabled={startIndex >= filteredLockers.length - visibleLockers} />
            </div>
          </div>
        </div>
      
    </div>
  );
}
