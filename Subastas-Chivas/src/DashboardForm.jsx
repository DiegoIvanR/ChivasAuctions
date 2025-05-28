import React, { useState } from 'react';
import './DashboardForm.css';

const DashboardForm = () => {
  const [selectedMatchDate, setSelectedMatchDate] = useState(null);
  const [selectedAuctionDate, setSelectedAuctionDate] = useState(null);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const generateCalendar = (selectedDate, setDate) => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);

    return (
      <div className="calendar">
        <h2 className="calendar-title">Selecciona la fecha</h2>
        <h1 className="calendar-date">Lun, 17 Ago</h1>
        <hr className="calendar-divider" />
        <div className="calendar-header">
          <span className="calendar-month">Agosto 2025</span>
          <div className="calendar-nav">
            <span className="arrow">&#x276E;</span>
            <span className="arrow">&#x276F;</span>
          </div>
        </div>
        <div className="calendar-grid">
          {["D", "L", "M", "M", "J", "V", "S"].map((day, index) => (
            <div className="calendar-day-name" key={`day-${index}`}>{day}</div>
          ))}
          {calendarDays.map((day, index) => (
            <div
              key={`cell-${index}`}
              className={`calendar-day ${selectedDate === day ? 'selected' : ''}`}
              onClick={() => day && setDate(day)}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-actions">
          <button className="cancel-button">Cancelar</button>
          <button className="ok-button">OK</button>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-wrapper">
      <h2 className="dashboard-title">DASHBOARD</h2>
      <div className="tag-container">
        <span className="tag">Analíticas</span>
        <span className="tag">Auctions</span>
        <span className="tag">Users</span>
        <button className="new-auction-btn">+ New Auction</button>
      </div>

      <div className="form-body">
        <input type="text" placeholder="Nombre del jugador" />
        <input type="text" placeholder="Número de la playera" />
        <input type="text" placeholder="Equipo rival" />
        <input type="text" placeholder="Monto inicial" />

        <div className="calendar-section">
          {generateCalendar(selectedMatchDate, setSelectedMatchDate)}
        </div>

        <div className="checkboxes">
          <label>
            <input type="checkbox" />
            Playera usada
          </label>
          <label>
            <input type="checkbox" />
            Playera firmada
          </label>
        </div>

        <input type="text" placeholder="Temporada" />
        <input type="text" placeholder="Fase del torneo" />

        <div className="calendar-section">
          {generateCalendar(selectedAuctionDate, setSelectedAuctionDate)}
        </div>

        <button className="submit-btn">Confirmar subasta</button>
      </div>
    </div>
  );
};

export default DashboardForm;

