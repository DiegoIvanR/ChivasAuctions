// src/LockerRoomSearch.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Locker from './Locker.jsx';
import ArrowButton from './ArrowButton';
import { supabase } from './supabaseClient';

export default function LockerRoomSearch() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const matchId     = queryParams.get('match_id');   // optional match filter
  const searchQuery = queryParams.get('query') || ''; // optional search by name

  const [filteredLockers, setFilteredLockers] = useState([]);
  const [startIndex, setStartIndex]           = useState(0);
  const [visibleLockers, setVisibleLockers]   = useState(7);

  const lockerWidth = 200; // width in px of each locker

  // Update visibleLockers based on window width
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

  // Ensure startIndex is within bounds when visibleLockers or filteredLockers change
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

  useEffect(() => {
    const fetchLockers = async () => {
      try {
        let results = [];

        // 1) If matchId is provided, do a single query filtered by match_id
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
              auctions (
                auction_id,
                auction_status,
                start_time,
                end_time,
                starting_bid
              ),
              matches (
                opponent,
                venue,
                competition
              )
            `)
            .eq('match_id', matchId);

          if (error) {
            console.error('Error fetching by match_id:', error.message);
            return;
          }
          results = data || [];
        }
        // 2) Else if searchQuery is provided, do two queries and merge
        else if (searchQuery) {
          const pattern = `%${searchQuery}%`;

          // Query A: filter by player_name
          const { data: byPlayerName, error: err1 } = await supabase
            .from('jerseys')
            .select(`
              jersey_id,
              match_id,
              player_name,
              jersey_number,
              size,
              image_url,
              auctions (
                auction_id,
                auction_status,
                start_time,
                end_time,
                starting_bid
              ),
              matches (
                opponent,
                venue,
                competition
              )
            `)
            .ilike('player_name', pattern);

          if (err1) {
            console.error('Error fetching by player_name:', err1.message);
            return;
          }

          // Query B: filter by matches.opponent
          const { data: byOpponent, error: err2 } = await supabase
            .from('jerseys')
            .select(`
              jersey_id,
              match_id,
              player_name,
              jersey_number,
              size,
              image_url,
              auctions (
                auction_id,
                auction_status,
                start_time,
                end_time,
                starting_bid
              ),
              matches (
                opponent,
                venue,
                competition
              )
            `)
            .filter('matches.opponent', 'ilike', pattern);

          if (err2) {
            console.error('Error fetching by opponent:', err2.message);
            return;
          }

          // Combine & dedupe by jersey_id
          const combined = [...(byPlayerName || []), ...(byOpponent || [])];
          const dedupedMap = new Map();
          combined.forEach((row) => {
            if (!dedupedMap.has(row.jersey_id)) {
              dedupedMap.set(row.jersey_id, row);
            }
          });
          results = Array.from(dedupedMap.values());
        }
        // 3) If no filter provided, fetch all
        else {
          const { data, error } = await supabase
            .from('jerseys')
            .select(`
              jersey_id,
              match_id,
              player_name,
              jersey_number,
              size,
              image_url,
              auctions (
                auction_id,
                auction_status,
                start_time,
                end_time,
                starting_bid
              ),
              matches (
                opponent,
                venue,
                competition
              )
            `);

          if (error) {
            console.error('Error fetching all lockers:', error.message);
            return;
          }
          results = data || [];
        }

        // 4) Normalize auctions: pick the first from array or null
        const processed = results.map((locker) => {
          if (Array.isArray(locker.auctions) && locker.auctions.length > 0) {
            locker.auctions = locker.auctions[0];
          } else {
            locker.auctions = null;
          }
          return locker;
        });

        // 5) Add left/right padding placeholders so carousel stays centered
        const nPadding = Math.max(0, visibleLockers - processed.length);
        const leftPads  = Math.floor(nPadding / 2);
        const rightPads = nPadding - leftPads;

        const paddedLockers = [
          ...Array(leftPads).fill({ jersey_id: null, player_name: '', match_id: '', auctions: null, matches: {} }),
          ...processed,
          ...Array(rightPads).fill({ jersey_id: null, player_name: '', match_id: '', auctions: null, matches: {} }),
        ];

        setFilteredLockers(paddedLockers);
      } catch (err) {
        console.error('Unexpected error fetching lockers:', err);
      }
    };

    fetchLockers();
  }, [matchId, searchQuery, visibleLockers]);

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const handleNext = () => {
    if (startIndex < filteredLockers.length - visibleLockers) {
      setStartIndex(startIndex + 1);
    }
  };

  return (
    <div className="locker-room-container">
      <img
        src="../public/top-locker-frame.png"
        className="top-door-frame"
        alt="Top locker frame"
      />
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
            <ArrowButton
              direction="right"
              onClick={handleNext}
              disabled={startIndex >= filteredLockers.length - visibleLockers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
