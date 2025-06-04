import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient"; // Ensure you have Supabase client configured
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
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
              match_date,
              venue,
              competition
            )
          `);

        if (error) {
          console.error("Error fetching auctions:", error.message);
          return;
        }

        // Process the data to ensure auctions are properly structured
        const processedData = data.map((jersey) => {
          jersey.auctions = Array.isArray(jersey.auctions) ? jersey.auctions[0] || null : null;
          return jersey;
        });

        setAuctions(processedData || []);
      } catch (err) {
        console.error("Unexpected error fetching auctions:", err);
      }
    };

    fetchAuctions();
  }, []);

  return (
    <div className="admin-dashboard-container">
      <h2>Subastas Creadas</h2>
      {auctions.length === 0 ? (
        <p>No hay subastas registradas.</p>
      ) : (
        auctions.map((auction) => (
          <div className="auction-card" key={auction.jersey_id}>
            <p><strong>Jugador:</strong> {auction.player_name || "Desconocido"}</p>
            <p><strong>Número:</strong> {auction.jersey_number || "N/A"}</p>
            <p><strong>Equipo rival:</strong> {auction.matches?.opponent || "N/A"}</p>
            <p><strong>Fecha del partido:</strong> {auction.matches?.match_date || "N/A"}</p>
            <p><strong>Puja inicial:</strong> {auction.auctions?.starting_bid || "N/A"} MXN</p>
            <p><strong>Inicio:</strong> {auction.auctions?.start_time || "N/A"}</p>
            <p><strong>Fin:</strong> {auction.auctions?.end_time || "N/A"}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminDashboard;