// Dashboard.jsx
import React, { useState } from "react";
import { jerseys } from "./jerseys";

const Dashboard = () => {
  const [refresh, setRefresh] = useState(false);

  const handleRefresh = () => {
    setRefresh(!refresh); // fuerza renderizado
  };

  return (
    <div>
      <h2>Dashboard de Subastas</h2>
      <button onClick={handleRefresh}>Actualizar</button>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {jerseys.map(jersey => (
          <div key={jersey.id} style={{ border: "1px solid gray", padding: "1rem", width: "250px" }}>
            <img src={jersey.img_src} alt={jersey.player} style={{ width: "100%" }} />
            <h4>{jersey.player} #{jersey.number}</h4>
            <p>Vs {jersey.match}</p>
            <p>Usada: {jersey.used ? "Sí" : "No"}</p>
            <p>Firmada: {jersey.signed ? "Sí" : "No"}</p>
            <p>Inicio: {jersey.starting_date}</p>
            <p>Fin: {jersey.end_date}</p>
            <p>Puja: ${jersey.highest_bid}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
