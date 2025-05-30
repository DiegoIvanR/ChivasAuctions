import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Locker from './Locker.jsx';
import ArrowButton from './ArrowButton';
import { supabase } from './supabaseClient';

const LockerRoomSearch = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const matchId = queryParams.get('match_id'); // Get match_id from URL
  const searchQuery = queryParams.get('query') || ''; // Get query from URL

  const [filteredLockers, setFilteredLockers] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [visibleLockers, setVisibleLockers] = useState(7);

  const lockerWidth = 200;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1400) {
        setVisibleLockers(7);
      } else if (width >= 1200) {
        setVisibleLockers(6);
      } else if (width >= 992) {
        setVisibleLockers(5);
      } else if (width >= 768) {
        setVisibleLockers(4);
      } else if (width >= 576) {
        setVisibleLockers(3);
      } else {
        setVisibleLockers(2);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (startIndex > filteredLockers.length - visibleLockers && filteredLockers.length > 0) {
      setStartIndex(Math.max(0, filteredLockers.length - visibleLockers));
    }
  }, [visibleLockers, filteredLockers.length, startIndex]);

  useEffect(() => {
    const fetchLockers = async () => {
      try {
        let query = supabase
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

        // Filter by match_id if provided
        if (matchId) {
          query = query.eq('match_id', matchId);
        }

        // Filter by search query if provided
        if (searchQuery) {
          query = query.or(`player_name.ilike.%${searchQuery}%,matches.opponent.ilike.%${searchQuery}%`);
        }

        const { data: lockers, error } = await query;

        if (error) {
          console.error('Error fetching lockers:', error.message);
          return;
        }

        // Process auctions array to ensure consistent data
        const processedLockers = lockers.map((locker) => {
          if (locker.auctions && locker.auctions.length > 0) {
            locker.auctions = locker.auctions[0]; // Use the first auction in the array
          } else {
            locker.auctions = null; // Handle cases where auctions array is empty
          }
          return locker;
        });

        // Add padding doors to maintain carousel structure
        const nPaddingDoors = Math.max(0, visibleLockers - processedLockers.length);
        const leftPaddingDoors = Math.floor(nPaddingDoors / 2);
        const rightPaddingDoors = nPaddingDoors - leftPaddingDoors;

        const paddedLockers = [
          ...Array(leftPaddingDoors).fill({ jersey_id: null, player_name: '', match: '' }),
          ...processedLockers,
          ...Array(rightPaddingDoors).fill({ jersey_id: null, player_name: '', match: '' }),
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
      <img src="../public/top-locker-frame.png" className="top-door-frame" alt="Top door frame" />
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
};

export default LockerRoomSearch;