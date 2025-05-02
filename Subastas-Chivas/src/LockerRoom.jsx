import React, { useState } from 'react';
import { jerseys } from './jerseys.js';
import ArrowButton from './ArrowButton';
import Locker from './Locker.jsx';

const LockerRoom = () => {
  const [lockers, setLockers] = useState([
    {id: 0, player: "Empty Locker", match: "No Match", signed: false, used: false},
    jerseys.javier_hernandez_15_05_2025,
    jerseys.mateo_chavez_15_05_2025,
    jerseys.fernando_gonzalez_15_05_2025,
    jerseys.fernando_beltran_15_05_2025,
    jerseys.roberto_alvarado_15_05_2025,
    {id: 6, player: "Empty Locker", match: "No Match", signed: false, used: false},
  ]);
  
  const [startIndex, setStartIndex] = useState(0);
  const [selectedLocker, setSelectedLocker] = useState(null);
  
  // Width of each locker viewport slot
  const lockerWidth = 341;
  // Number of lockers visible at once
  const visibleLockers = 5;
  
  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };
  
  const handleNext = () => {
    if (startIndex < lockers.length - visibleLockers) {
      setStartIndex(startIndex + 1);
    }
  };
  
  const handleLockerClick = (lockerId) => {
    setSelectedLocker(lockerId);
  };
  
  return (
    <div className="locker-room-container">
      <img src="../public/top-door-frame.png" className="top-door-frame" alt="Top door frame" />
      
      <div className="carousel-container">
        <div className="carousel-controls">
          {/* Locker list with proper positioning */}
          <div 
            className="locker-list"
            style={{
              transform: `translateX(calc(50% - ${lockerWidth * visibleLockers / 2}px + ${-startIndex * lockerWidth}px))`,
              width: `${lockers.length * lockerWidth}px`, /* Set explicit width for all lockers */
            }}
          >
            {lockers.map((locker) => (
              <div key={locker.id} className='locker-wrapper'>
                <Locker
                  locker={locker}
                  onClick={handleLockerClick}
                  isSelected={selectedLocker === locker.id}
                />
              </div>
            ))}
          </div>
          
          {/* Navigation buttons */}
          <div className="arrow-buttons">
            <ArrowButton
              direction="left"
              onClick={handlePrev}
              disabled={startIndex === 0}
            />
            <ArrowButton
              direction="right"
              onClick={handleNext}
              disabled={startIndex >= lockers.length - visibleLockers}
            />
          </div>
        </div>
      </div>
      
      {selectedLocker && (
        <div className="selected-locker-details">
        </div>
      )}
    </div>
  );
};

export default LockerRoom;