import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./AdminDashboard.css";
import BidHistory from "./BidHistory";

const AdminDashboard = () => {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      const { data, error } = await supabase
        .from("jerseys")
        .select(`
          jersey_id,
          player_name,
          jersey_number,
          image_url,
          used,
          signed,
          auctions (
            auction_id,
            auction_status,
            start_time,
            end_time,
            starting_bid
          ),
          matches (
            opponent,
            match_date
          )
        `);

      if (error) {
        console.error("Error fetching auctions:", error.message);
        return;
      }

      const processedData = data.map((jersey) => ({
        ...jersey,
        auctions: Array.isArray(jersey.auctions) ? jersey.auctions[0] || null : null,
      }));

      setAuctions(processedData);
    };

    fetchAuctions();
  }, []);

  return (
    <div className="admin-dashboard-wrapper">
      <div className="dashboard-top-bar">
        <div className="button-group">
          <button className="dashboard-button">Analytics</button>
          <button className="dashboard-button active">Subastas</button>
          <button className="dashboard-button">Usuarios</button>
          <button className="dashboard-button red">+ Nueva Subasta</button>
        </div>
        <div className="filter-group">
          <button className="dashboard-tab active">EVENTOS ACTIVOS</button>
          <button className="dashboard-tab">HISTORIAL</button>
        </div>
      </div>

      <h2 className="dashboard-title">Subastas Creadas</h2>

      {auctions.length === 0 ? (
        <p className="no-auctions">No hay subastas registradas.</p>
      ) : (
        <div className="admin-dashboard-board">
          {auctions.map((auction) => (
            <div className="auction-card" key={auction.jersey_id}>
              <img
                src={auction.image_url}
                alt={`Jersey de ${auction.player_name}`}
                className="jersey-image"
              />

              <div className="bid-column">
                <p className="section-title">Últimas Pujas</p>
                <div className="bid-history-wrapper">
                  <BidHistory auctionID={auction.auctions?.auction_id} />
                </div>
              </div>

              <div className="auction-info">
                <p><strong>Jugador:</strong> {auction.player_name || "Desconocido"}</p>
                <p><strong>Número:</strong> {auction.jersey_number || "N/A"}</p>
                <p><strong>Equipo rival:</strong> {auction.matches?.opponent || "N/A"}</p>
                <p><strong>Fecha del partido:</strong> {auction.matches?.match_date || "N/A"}</p>
                <p><strong>Puja inicial:</strong> {auction.auctions?.starting_bid ? `${auction.auctions.starting_bid} MXN` : "N/A"}</p>
                <p><strong>Inicio:</strong> {auction.auctions?.start_time || "N/A"}</p>
                <p><strong>Fin:</strong> {auction.auctions?.end_time || "N/A"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

