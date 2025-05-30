import React, { useState, useEffect } from 'react';
import './DashboardForm.css';

const DashboardForm = () => {
  const [selectedMatchDate, setSelectedMatchDate] = useState(null);
  const [selectedAuctionDate, setSelectedAuctionDate] = useState(null);
  const [matchDay, setMatchDay] = useState(null);
  const [auctionDay, setAuctionDay] = useState(null);
  const [monthOffset, setMonthOffset] = useState(0);

  useEffect(() => {
    if (selectedMatchDate) {
      console.log("Fecha de inicio de subasta seleccionada:", selectedMatchDate);
    }
  }, [selectedMatchDate]);

  useEffect(() => {
    if (selectedAuctionDate) {
      console.log("Fecha de final de subasta seleccionada:", selectedAuctionDate);
    }
  }, [selectedAuctionDate]);

  const today = new Date();
  const currentMonth = today.getMonth() + monthOffset;
  const currentYear = today.getFullYear();
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const generateCalendar = (selectedDate, setDate, selectedDay, setDay) => {
    const baseDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const daysInMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1).getDay();

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);

    const selectedFullDate = selectedDay ? new Date(baseDate.getFullYear(), baseDate.getMonth(), selectedDay) : null;
    const dayName = selectedFullDate ? dayNames[selectedFullDate.getDay()] : 'Lun';

    return (
      <div className="calendar">
        <h2 className="calendar-title">Selecciona la fecha</h2>
        <h1 className="calendar-date">{selectedDay ? `${dayName}, ${selectedDay} ${monthNames[baseDate.getMonth()].substring(0, 3)}` : 'Lun, 17 Ago'}</h1>
        <hr className="calendar-divider" />
        <div className="calendar-header">
          <span className="calendar-month" onClick={() => setMonthOffset(monthOffset - 1)} style={{ cursor: 'pointer' }}>&lt;</span>
          <span className="calendar-month" style={{ cursor: 'pointer' }}>{monthNames[baseDate.getMonth()]} {baseDate.getFullYear()}</span>
          <span className="calendar-month" onClick={() => setMonthOffset(monthOffset + 1)} style={{ cursor: 'pointer' }}>&gt;</span>
        </div>
        <div className="calendar-grid">
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
            <div className="calendar-day-name" key={`day-${index}`}>{day}</div>
          ))}
          {calendarDays.map((day, index) => (
            <div
              key={`cell-${index}`}
              className={`calendar-day ${selectedDay === day ? 'selected' : ''}`}
              onClick={() => {
                if (day) {
                  setDay(day);
                  setDate(new Date(baseDate.getFullYear(), baseDate.getMonth(), day));
                }
              }}
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
          {generateCalendar(selectedMatchDate, setSelectedMatchDate, matchDay, setMatchDay)}
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
          {generateCalendar(selectedAuctionDate, setSelectedAuctionDate, auctionDay, setAuctionDay)}
        </div>

        <button className="submit-btn">Confirmar subasta</button>
      </div>
    </div>
  );
};

export default DashboardForm;