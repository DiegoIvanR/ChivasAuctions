import React, { useState, useEffect } from 'react';
import { jerseys } from './jerseys.js';
import { useLocation } from 'react-router-dom'; // Import useLocation
import ArrowButton from './ArrowButton';
import Locker from './Locker.jsx';

const LockerRoom = () => {
  const location = useLocation(); // Get location state
  const matchFilter = location.state?.match || ''; // Retrieve match from state
  const [lockers, setLockers] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [selectedLocker, setSelectedLocker] = useState(null);
  const [visibleLockers, setVisibleLockers] = useState(7);


  const lockerWidth = 200;

  useEffect(() => {
    const filteredJerseys = jerseys.filter(jersey => jersey.match === matchFilter);
    
    const withPadding = [
      { id: 0, player: "Empty Locker", match: "No Match", signed: false, used: false},    // empty at start
      { id: 321, player: "Empty Locker", match: "No Match", signed: false, used: false},
      ...filteredJerseys,          // real matches
      { id: -1, player: "Empty Locker", match: "No Match", signed: false, used: false}     // empty at end
    ];
    setLockers(withPadding);

  }, [matchFilter]);

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

    // Initial call
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (startIndex > lockers.length - visibleLockers && lockers.length > 0) {
      setStartIndex(Math.max(0, lockers.length - visibleLockers));
    }
  }, [visibleLockers, lockers.length, startIndex]);


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
      <img src="../public/top-locker-frame.png" className="top-door-frame" alt="Top door frame" />
      
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
              <div key={locker.id} className="locker-wrapper">
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