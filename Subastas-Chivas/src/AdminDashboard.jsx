import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./AdminDashboard.css";
import BidHistory from "./BidHistory";
import JerseyAttributes from "./JerseyAttributes";
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
            highest_bid
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

  // Helper function to format dates
  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

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
              <div className="auction-dash-info">
                <div className="auction-dash-player">
                  <p className="auction-dash-name">{auction.player_name || "Desconocido"}</p>
                  <p className="auction-dash-jersey">#{auction.jersey_number || "N/A"}</p>
                </div>
                <p className="auction-dash-id">ID: {auction.auctions?.auction_id || "N/A"}</p>
                <p className="auction-dash-stbid">Highest Bid: {auction.auctions?.highest_bid ? `${auction.auctions.highest_bid} USD` : "N/A"}</p>

                <div className="auction-dash-match">
                  <p className="auction-dash-opponent">VS {auction.matches?.opponent || "N/A"}</p>
                  <p className="auction-dash-date">{auction.matches?.match_date || "N/A"}</p>
                </div>
                <JerseyAttributes jersey={auction} />
                
                <p className="auction-dash-start">
                  Inicio: {formatDate(auction.auctions?.start_time)}
                </p>
                <p className="auction-dash-end">
                  Fin: {formatDate(auction.auctions?.end_time)}
                </p>
              </div>

              <div className="bid-column">
                <p className="section-title">Historial de Pujas</p>
                <div className="bid-history-wrapper">
                  <BidHistory auctionID={auction.auctions?.auction_id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;