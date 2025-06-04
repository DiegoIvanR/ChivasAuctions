import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("adminAuctions")) || [];
    setAuctions(stored);
  }, []);

  return (
    <div className="admin-dashboard-container">
      <h2>Subastas Creadas</h2>
      {auctions.length === 0 ? (
        <p>No hay subastas registradas.</p>
      ) : (
        auctions.map((auction) => (
          <div className="auction-card" key={auction.id}>
            <p><strong>Jugador:</strong> {auction.player}</p>
            <p><strong>Equipo rival:</strong> {auction.match}</p>
            <p><strong>Número:</strong> {auction.number}</p>
            <p><strong>Puja inicial:</strong> {auction.highest_bid} MXN</p>
            <p><strong>Inicio:</strong> {auction.starting_date}</p>
            <p><strong>Fin:</strong> {auction.end_date}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminDashboard;



