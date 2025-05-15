import React, { useEffect, useState } from 'react';
import JerseyAttributes from './JerseyAttributes.jsx';
import { useNavigate } from 'react-router-dom';
// USES ZULU TIME, 20:00 UTC -> 14:00 CDMX

const Locker = ({ locker, isSelected }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimeLeft = () => {
      if (!locker.end_date) return;

      const now = new Date();
      const end = new Date(locker.end_date);
      const diffMs = end - now;
      if (diffMs <= 0) {
        setTimeLeft("Terminada");
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      if (days > 0) {
        setTimeLeft(`quedan ${days} días`);
      } else if (hours > 0) {
        setTimeLeft(`quedan ${hours} horas`);
      } else if (minutes > 0) {
        setTimeLeft(`quedan ${minutes} minutos`);
      } else {
        setTimeLeft(`quedan ${seconds} segundos`);
      }
    };

    updateTimeLeft(); // Run once immediately
    const interval = setInterval(updateTimeLeft, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup when component unmounts
  }, [locker.end_date]);

  const navigate = useNavigate();
	
	const handleClick = (e) => {
    if(locker.player){
      navigate(`/auction/${locker.id}`);
    }
  };

  return (
    <div 
      className={`locker-container ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <div className="locker-image-container">
        <img 
          src="../public/locker.png" 
          className="locker-image" 
          alt={`locker ${locker.id}`}
          onError={(e) => {
            console.error("Image failed to load:", e);
            e.target.style.height = "100%";
            e.target.style.width = "auto";
          }}
        />
        {locker.img_src && (
          <img
            className='locker-jersey-image'
            src={locker.img_src}
          />
        )}
        {locker.player && (
          <div className="locker-label">
            {locker.player}
          </div>
        )}
        {locker.match && (
          <div className="locker-status">
            {timeLeft === "Terminada" ? "PUJA FINAL" : "PUJA ACTUAL"}
          </div>
        )}
        {locker.highest_bid && (
          <div className="locker-bid-container">
            <div className='locker-bid'>
              ${locker.highest_bid}
            </div>
          </div>
        )}
        <div className="locker-attributes">
          <JerseyAttributes jersey={locker} />
        </div>
        {locker.end_date && (
          <div className="locker-time-remaining">
            {timeLeft}
          </div>
        )}
      </div>
    </div>
  );
};

export default Locker;
