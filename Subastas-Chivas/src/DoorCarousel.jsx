import React, { useState } from 'react';
import { matches } from './matches.js'; // Import the matches data
import ArrowButton from './ArrowButton'; // Import the ArrowButton component
import Door from './Door'; // Import the Door component

const DoorCarousel = () => {
  const [doors, setDoors] = useState([
    matches.america_15_05_2025,
    matches.pumas_16_05_2025,
    matches.rayados_17_05_2025,
    { id: 4, team: 'Chivas', color: 'red' },
  ]);

  const [startIndex, setStartIndex] = useState(0);
  const [selectedDoor, setSelectedDoor] = useState(null);

  const visibleDoors = doors.slice(startIndex, startIndex + 3);

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

  const handleDoorClick = (doorId) => {
    setSelectedDoor(doorId);
  };

  return (
    <div className="carousel-container">
      <div className="carousel-controls">
        {/* Previous Button */}
        <ArrowButton 
          direction="left" 
          onClick={handlePrev} 
          disabled={startIndex === 0} 
        />

        {/* Door List */}
        <div className="door-list">
          {visibleDoors.map((door) => (
            <Door 
              key={door.id}
              door={door}
              onClick={handleDoorClick}
              isSelected={selectedDoor === door.id}
            />
          ))}
        </div>

        {/* Next Button */}
        <ArrowButton 
          direction="right" 
          onClick={handleNext} 
          disabled={startIndex >= doors.length - 3}
        />
      </div>

      {selectedDoor && (
        <div className="selected-message">
          You selected Door {selectedDoor}!
        </div>
      )}
    </div>
  );
};

export default DoorCarousel;
