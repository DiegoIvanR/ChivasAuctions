import React, { useState, useEffect } from 'react';

const JerseyCard = ({ jersey, filter }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const updateStatusAndTimeLeft = () => {
      if (!jersey.auctions?.start_time || !jersey.auctions?.end_time) {
        setStatus('');
        setTimeLeft('');
        return;
      }

      const now = new Date();
      const start = new Date(jersey.auctions.start_time);
      const end = new Date(jersey.auctions.end_time);

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
  }, [jersey.auctions?.start_time, jersey.auctions?.end_time]);

  return (
    <div className="stat-card jersey-card animate-pop-in">
      <img
        src={jersey.auctions.jerseys.image_url.replace('../public', '')}
        alt={jersey.auctions.jerseys.player_name}
        className="jersey-image"
      />
      <div className="jersey-info">
        <h3>{jersey.auctions.jerseys.player_name}</h3>
        <p>{filter === 'EN VIVO' ? 'PUJA ACTUAL' : filter === 'CERRADAS' ? 'PUJA FINALIZADA' : 'PUJA GANADA'}</p>
        <p className="price">${jersey.auctions.highest_bid}</p>
        <div className="tags">
          {jersey.auctions.jerseys.used && <span className="tag">USADA</span>}
          {jersey.auctions.jerseys.signed && <span className="tag">FIRMADA</span>}
        </div>
        <p className="estado">{status}</p>
      </div>
    </div>
  );
};

export default JerseyCard;