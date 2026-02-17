import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JerseyAttributes from './JerseyAttributes';
const Locker = ({ locker }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const updateStatusAndTimeLeft = () => {
      if (!locker.auctions?.start_time || !locker.auctions?.end_time) {
        setStatus('');
        setTimeLeft('');
        return;
      }

      const now = new Date();
      const start = new Date(locker.auctions.start_time);
      const end = new Date(locker.auctions.end_time);

      const diffMs = end - now;
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      if (now < start) {
        setStatus('PUJA FUTURA');
        if (days > 0) {
          setTimeLeft(`faltan ${days} días`);
        } else if (hours > 0) {
          setTimeLeft(`faltan ${hours} horas`);
        } else if (minutes > 0) {
          setTimeLeft(`faltan ${minutes} minutos`);
        } else {
          setTimeLeft(`faltan ${seconds} segundos`);
        }
      } else if (now >= start && now <= end) {
        setStatus('PUJA ACTUAL');
        if (diffMs <= 0) {
          setTimeLeft('Terminada');
        } else if (days > 0) {
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
      navigate(`/auction/${locker.auctions.auction_id}`);
    }
  };

  return (
    <div className="locker-container" onClick={handleClick}>
      <div className="locker-image-container">
        <img
          src="../locker.png"
          className="locker-image"
          alt={`locker ${locker.jersey_id}`}
          onError={(e) => {
            e.target.style.height = '100%';
            e.target.style.width = 'auto';
          }}
        />
        {locker.image_url && <img src='../hanger.png' className='locker-hanger' alt='hanger' />}
        {locker.image_url && <img className="locker-jersey-image" src={locker.image_url} alt="Jersey" />}
        {locker.player_name && <div className="locker-label">{locker.player_name}</div>}
        {locker.matches?.opponent && (
          <div className="locker-match-info">
            <span className="locker-extra-info">{locker.matches.opponent} - {locker.matches.match_date}</span>
          </div>
        )}
        {locker.auctions?.highest_bid && (
          <div className="locker-bid-container">
            <div className="locker-bid">${locker.auctions.highest_bid}</div>
          </div>
        )}
        <div className="locker-attributes">
          <JerseyAttributes jersey={locker} />
        </div>
        {status && <div className={`locker-status locker-status-${status.toLowerCase()}`}>{status}</div>}
        {timeLeft && <div className="locker-time-remaining">{timeLeft}</div>}
      </div>
    </div>
  );
};

export default Locker;