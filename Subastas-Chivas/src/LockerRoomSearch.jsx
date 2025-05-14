import React, { useState, useEffect } from 'react';
import { jerseys } from './jerseys.js';
import { useLocation } from 'react-router-dom'; // Import useLocation
import Locker from './Locker.jsx';
import ArrowButton from './ArrowButton';

const LockerRoomSearch = () => {
  const location = useLocation(); // Get the current location
  const queryParams = new URLSearchParams(location.search); // Parse query parameters
  const searchQuery = queryParams.get('query') || ''; // Get the 'query' parameter

  const [filteredLockers, setFilteredLockers] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [visibleLockers, setVisibleLockers] = useState(7);
  const [selectedLocker, setSelectedLocker] = useState(null);

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

    // Initial call
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (startIndex > filteredLockers.length - visibleLockers && filteredLockers.length > 0) {
      setStartIndex(Math.max(0, filteredLockers.length - visibleLockers));
    }
  }, [visibleLockers, filteredLockers.length, startIndex]);

  useEffect(() => {
    // Filter jerseys based on the search query
    const regex = new RegExp(searchQuery, 'i'); // Case-insensitive regex
    const filteredJerseys = jerseys.filter(
      (jersey) =>
        regex.test(jersey.player) || regex.test(jersey.match) || regex.test(jersey.number.toString())
    );

        
    const nPaddingDoors = 7 - filteredJerseys.length;
    const leftPaddingDoors = Math.floor(nPaddingDoors/2);
    const rightPaddingDoors = nPaddingDoors - leftPaddingDoors;
    let withPadding = [];
    for (let i = 0;  i <leftPaddingDoors; i++){
        withPadding.push({id: i + 1000, player: "", match: ""})
    
    }
    withPadding.push(...filteredJerseys)
    for (let i = 0;  i <rightPaddingDoors; i++){
    withPadding.push({id: i + 1000 + leftPaddingDoors, player: "", match: ""})

    }
    setFilteredLockers(withPadding);
  }, [searchQuery]);

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
              width: `${filteredLockers.length * lockerWidth}px`, /* Set explicit width for all lockers */
            }}
          >
            {filteredLockers.map((locker) => (
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
              disabled={startIndex >= filteredLockers.length - visibleLockers}
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

export default LockerRoomSearch;