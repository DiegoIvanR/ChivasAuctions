// src/DoorCarousel.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import ArrowButton from './ArrowButton';
import Door from './Door';

export default function DoorCarousel() {
  const [doors, setDoors] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [selectedDoor, setSelectedDoor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLiveAuctions = async () => {
      try {
        // Compute current ISO timestamp once
        const nowISO = new Date().toISOString();

        // 1) Query the `auctions` table, filtering for "live" (NOW() between start_time & end_time)
        // 2) Inner‐join `jerseys` then inner‐join `matches` in a single select
        const { data, error } = await supabase
          .from('auctions')
          .select(`
            auction_id,
            start_time,
            end_time,
            jerseys!inner(
              jersey_id,
              matches!inner(
                match_id,
                match_date,
                opponent,
                venue,
                competition
              )
            )
          `)
          .lte('start_time', nowISO)  // start_time <= NOW
          .gte('end_time', nowISO);   // end_time >= NOW

        if (error) {
          console.error('Error fetching live auctions:', error);
          return;
        }

        // 3) Transform each row into the “door” object for the carousel
        //
        //    data is an array of objects like:
        //    [
        //      {
        //        auction_id: '…',
        //        start_time: '2025-06-01T12:00:00Z',
        //        end_time:   '2025-06-05T12:00:00Z',
        //        jerseys: {
        //          jersey_id: '…',
        //          matches: {
        //            match_id: '…',
        //            match_date: '2025-06-01',
        //            opponent: 'Chivas',
        //            venue: 'Estadio Akron',
        //            competition: 'Liga MX'
        //          }
        //        }
        //      },
        //      … more rows …
        //    ]
        //
        //    We want a flat array of “door” objects:
        //    [
        //      {
        //        match_id: '…',
        //        match_date: '…',
        //        opponent: '…',
        //        venue: '…',
        //        competition: '…',
        //        jersey_id: '…',
        //        auction_id: '…'
        //      },
        //      … more doors …
        //    ]

        const transformedDoors = data.map((row) => {
          const { jerseys } = row;
          const { matches } = jerseys;

          return {
            match_id: matches.match_id,
            match_date: matches.match_date,
            opponent: matches.opponent,
            venue: matches.venue,
            competition: matches.competition,
            jersey_id: jerseys.jersey_id,
            auction_id: row.auction_id,
          };
        });

        const nPaddingDoors = Math.max(0, 3 - transformedDoors.length);
        console.log(`Padding doors needed: ${nPaddingDoors}`);
        const leftPaddingDoors = Math.floor(nPaddingDoors / 2);
        const rightPaddingDoors = nPaddingDoors - leftPaddingDoors;

       

        // 4) Add empty “padding” doors at front/end so you can scroll nicely
        const withPadding = [
          ...Array(leftPaddingDoors).fill({ match_id: 'padding-start', match_date: '', opponent: '', venue: '', competition: '', jersey_id: '', auction_id: '' }),
          ...transformedDoors,
          ...Array(rightPaddingDoors).fill({ match_id: 'padding-end', match_date: '', opponent: '', venue: '', competition: '', jersey_id: '', auction_id: '' }),
        ];

        setDoors(withPadding);
      } catch (err) {
        console.error('Unexpected error during fetchLiveAuctions():', err);
      }
    };

    fetchLiveAuctions();
  }, []); // run once

  // Carousel controls
  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const handleNext = () => {
    if (startIndex < doors.length - 3) {
      setStartIndex(startIndex + 1);
    }
  };

  // When a door is clicked, navigate to a “locker‐room‐search” route with match_id
  const handleDoorClick = (door) => {
    if (!door.match_id || door.match_id.startsWith('padding')) return;
    setSelectedDoor(door.match_id);
    navigate(`/locker-room-search?match_id=${encodeURIComponent(door.match_id)}`);
  };

  return (
    <div className="carousel-container">
      <img
        src="../public/top-door-frame.png"
        className="top-door-frame"
        alt="Top door frame"
      />

      <div className="carousel-controls">
        <div
          className="door-list"
          style={{
            transform: `translateX(calc(50% - ${startIndex * 478}px - 720px))`,
          }}
        >
          {doors.map((door, idx) => (
            <div key={idx} className="door-wrapper">
              <Door
                door={door}
                onClick={() => handleDoorClick(door)}
                isSelected={selectedDoor === door.match_id}
              />
            </div>
          ))}
        </div>

        <div className="arrow-buttons">
          <ArrowButton direction="left" onClick={handlePrev} disabled={startIndex === 0} />
          <ArrowButton direction="right" onClick={handleNext} disabled={startIndex >= doors.length - 3} />
        </div>
      </div>

      {selectedDoor && (
        <div className="selected-message">You selected Match {selectedDoor}!</div>
      )}
    </div>
  );
}
