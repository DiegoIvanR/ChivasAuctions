import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Locker = ({ locker }) => {
  const [timeLeft, setTimeLeft] = useState('');
  //const [timeStart, setTimeStart] = useState('');
  const [status, setStatus] = useState(''); // State to store auction status
  const navigate = useNavigate();

  useEffect(() => {
    const updateStatusAndTimeLeft = () => {
      if (!locker.auctions?.start_time || !locker.auctions?.end_time) return;

      const now = new Date();
      const start = new Date(locker.auctions.start_time);
      const end = new Date(locker.auctions.end_time);

      const diffMs = end - now;
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);


      // Determine auction status
      if (now < start) {
        if (Math.abs(days) > 0) {
          setTimeLeft(`faltan ${days} días`);
        } else if (Math.abs(hours > 0)) {
          setTimeLeft(`faltan ${hours} horas`);
        } else if (Math.abs(minutes > 0)) {
          setTimeLeft(`faltan ${minutes} minutos`);
        } else {
          setTimeLeft(`faltan ${seconds} segundos`);
        }
        setStatus('PUJA FUTURA');

      } else if (now >= start && now <= end) {
        if (diffMs <= 0) {
          setTimeLeft("Terminada");
          return;
        }
        setStatus('PUJA ACTUAL');

        if (days > 0) {
          setTimeLeft(`quedan ${days} días`);
        } else if (hours > 0) {
          setTimeLeft(`quedan ${hours} horas`);
        } else if (minutes > 0) {
          setTimeLeft(`quedan ${minutes} minutos`);
        } else {
          setTimeLeft(`quedan ${seconds} segundos`);
        }
      } else {
        setStatus('PUJA FINAL');
        setTimeLeft('Terminada');
      }
    };

    updateStatusAndTimeLeft();
    const interval = setInterval(updateStatusAndTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [locker.auctions?.start_time, locker.auctions?.end_time]);

  const handleClick = () => {
    if (locker.auctions?.auction_id) {
      navigate(`/auction/${locker.auctions.auction_id}`); // Redirect to LockerAuction page
    }
  };

  return (
    <div className="locker-container" onClick={handleClick}>
      <div className="locker-image-container">
        <img
          src="../public/locker.png"
          className="locker-image"
          alt={`locker ${locker.jersey_id}`}
          onError={(e) => {
            e.target.style.height = '100%';
            e.target.style.width = 'auto';
          }}
        />
        {locker.image_url && <img className="locker-jersey-image" src={locker.image_url} />}
        {locker.player_name && <div className="locker-label">{locker.player_name}</div>}
        {locker.auctions?.starting_bid && (
          <div className="locker-bid-container">
            <div className="locker-bid">${locker.auctions.starting_bid}</div>
          </div>
        )}
        {status && <div className={`locker-status locker-status-${status.toLowerCase()}`}>{status}</div>}
        {timeLeft && <div className="locker-time-remaining">{timeLeft}</div>}
      </div>
    </div>
  );
};

export default Locker;