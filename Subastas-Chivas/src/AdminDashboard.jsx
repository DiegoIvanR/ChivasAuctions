import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./AdminDashboard.css";
import BidHistory from "./BidHistory";
import JerseyAttributes from "./JerseyAttributes";
import DashboardAside from "./DashboardAside";
const AdminDashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [filter, setFilter] = useState('HISTORIAL'); // State to track the active filter

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        let query = supabase
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

        const now = new Date().toISOString(); // Format current date as ISO string
        
        if (filter === 'EVENTOS ACTIVOS') {
          // Filter for active auctions (end_time is greater than or equal to now)
          console.log("Fetching active auctions");
          query = query.gte('auctions.end_time', now);
        } else if (filter === 'HISTORIAL') {
          // Filter for closed auctions (end_time is less than now)
          console.log("Fetching closed auctions");
          query = query.lt('auctions.end_time', now);
        }
        const { data, error } = await query;

        if (error) {
          console.error("Error fetching auctions:", error.message);
          return;
        }

        const processedData = data
          .filter((jersey) => jersey.auctions && jersey.auctions.length > 0) // Only include jerseys with auctions
          .map((jersey) => ({
            ...jersey,
            auctions: Array.isArray(jersey.auctions) ? jersey.auctions[0] || null : null,
          }));

        setAuctions(processedData);
      } catch (err) {
        console.error('Unexpected error fetching auctions:', err);
      }
    };

    fetchAuctions();
  }, [filter]); // Add filter as dependency

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
          <button
            className={`dashboard-tab ${filter === 'EVENTOS ACTIVOS' ? 'active' : ''}`}
            onClick={() => {
              console.log('Switching to EVENTOS ACTIVOS');
              setFilter('EVENTOS ACTIVOS');
            }}
          >
            EVENTOS ACTIVOS
          </button>
          <button
            className={`dashboard-tab ${filter === 'HISTORIAL' ? 'active' : ''}`}
            onClick={() => {
              console.log('Switching to HISTORIAL');
              setFilter('HISTORIAL');
            }}
          >
            HISTORIAL
          </button>
        </div>
      </div>
      <div className="dashboard-buffer">
        <DashboardAside />
        {auctions.length === 0 ? (
          <p className="no-auctions">
            {filter === 'EVENTOS ACTIVOS' 
              ? "No hay subastas activas registradas." 
              : "No hay subastas en el historial."
            }
          </p>
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
                    {auction.auctions?.auction_id ? (
                      <BidHistory auctionID={auction.auctions.auction_id} />
                    ) : (
                      <p className="no-bids">No hay información de subasta disponible</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
};

export default AdminDashboard;