import React, { useEffect, useState } from 'react';
// USES ZULU TIME, 20:00 UTC -> 14:00 CDMX

const Locker = ({ locker, onClick, isSelected }) => {
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

  return (
    <div 
      className={`locker-container ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(locker.id)}
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
        {locker.player && (
          <div className="locker-label">
            {locker.player}
          </div>
        )}
        {locker.match && (
          <div className="locker-date">
            {locker.match}
          </div>
        )}
        {locker.end_date && (
          <div className="locker-date">
            {timeLeft}
          </div>
        )}
      </div>
    </div>
  );
};

export default Locker;
