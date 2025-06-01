import React from 'react';
const StatCard = ({ title, value }) => {
  return (
    <div className="stat-card animate-pop-in">
      <h2>{value}</h2>
      <p>{title}</p>
    </div>
  );
};

export default StatCard;