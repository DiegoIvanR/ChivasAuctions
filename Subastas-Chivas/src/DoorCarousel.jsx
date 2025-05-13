import React, { useState, useEffect } from 'react';
import { matches } from './matches.js';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import ArrowButton from './ArrowButton';
import Door from './Door';

const DoorCarousel = () => {
  const [doors, setDoors] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [selectedDoor, setSelectedDoor] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const allMatches = Object.keys(matches).map(key => matches[key]);
    const withPadding = [
      { id: 0, team: '', match: '' },
      ...allMatches,
      { id: -1, team: '', match: '' }
    ];
    setDoors(withPadding);
  }, []);

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

  const handleDoorClick = (door) => {
    setSelectedDoor(door.id);
    navigate('/locker-room', { state: { match: door.match } }); // Navigate to LockerRoom with match data
  };

  return (
    <div className="carousel-container">
      <img src="../public/top-door-frame.png" className="top-door-frame" alt="Top door frame" />
      <div className="carousel-controls">
        <div className="door-list" style={{ transform: `translateX(calc(50% - ${startIndex * 478}px - 720px))` }}>
          {doors.map((door) => (
            <div key={door.id} className="door-wrapper">
              <Door
                door={door}
                onClick={() => handleDoorClick(door)}
                isSelected={selectedDoor === door.id}
              />
            </div>
          ))}
        </div>
        <div className="arrow-buttons">
          <ArrowButton direction="left" onClick={handlePrev} disabled={startIndex === 0} />
          <ArrowButton direction="right" onClick={handleNext} disabled={startIndex >= doors.length - 3} />
        </div>
      </div>
      {selectedDoor && <div className="selected-message">You selected Door {selectedDoor}!</div>}
    </div>
  );
};

export default DoorCarousel;