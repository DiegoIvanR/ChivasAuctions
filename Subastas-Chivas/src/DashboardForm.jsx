import React, { useState } from 'react';
import './DashboardForm.css';

const DashboardForm = () => {
  const [formData, setFormData] = useState({
    playerName: '',
    jerseyNumber: '',
    rival: '',
    amount: '',
    matchDate: null,
    auctionStart: null,
    auctionEnd: null,
  });

  const [calendarState, setCalendarState] = useState({
    matchDate: new Date(2025, 5),
    auctionStart: new Date(2025, 5),
    auctionEnd: new Date(2025, 5),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDaySelect = (calendarKey, day) => {
    const baseDate = calendarState[calendarKey];
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), day);

    const formatted = date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });

    setFormData(prev => ({
      ...prev,
      [calendarKey]: {
        raw: day,
        text: formatted,
        fullDate: date,
      },
    }));
  };

  const changeMonth = (calendarKey, direction) => {
    setCalendarState(prev => {
      const current = prev[calendarKey];
      const newDate = new Date(current.getFullYear(), current.getMonth() + direction, 1);
      return { ...prev, [calendarKey]: newDate };
    });
  };

  const renderCalendar = (title, calendarKey) => {
    const selected = formData[calendarKey]?.fullDate;
    const currentMonth = calendarState[calendarKey];

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);

    const isSelected = (day) =>
      selected &&
      selected.getDate() === day &&
      selected.getMonth() === month &&
      selected.getFullYear() === year;

    const monthName = currentMonth.toLocaleDateString('es-MX', {
      month: 'long',
      year: 'numeric',
    });

    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <p className="calendar-title">{title}</p>
          <p className="calendar-date">
            {formData[calendarKey]?.text || 'Selecciona una fecha'}
          </p>
        </div>

        <div className="calendar-box">
          <div className="calendar-nav-container">
            <button onClick={() => changeMonth(calendarKey, -1)} className="arrow left-arrow">{'\u276E'}</button>
            <span className="calendar-month">{monthName}</span>
            <button onClick={() => changeMonth(calendarKey, 1)} className="arrow right-arrow">{'\u276F'}</button>
          </div>

          <div className="calendar-grid">
            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
              <span key={i} className="day-name">{d}</span>
            ))}
            {calendarDays.map((day, index) => (
              <span
                key={index}
                className={`calendar-day ${isSelected(day) ? 'selected' : ''}`}
                onClick={() => day && handleDaySelect(calendarKey, day)}
              >
                {day}
              </span>
            ))}
          </div>

          <div className="calendar-actions">
            <button className="cancel-btn">Cancelar</button>
            <button className="ok-btn">OK</button>
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = () => {
    console.log('Datos confirmados:', formData);
  };

  return (
    <div className="dashboard-form-wrapper">
      <h2 className="dashboard-title">DASHBOARD</h2>

      <div className="form-content">
        <input type="text" name="playerName" placeholder="Nombre del jugador" onChange={handleInputChange} />
        <input type="text" name="jerseyNumber" placeholder="Número de la playera" onChange={handleInputChange} />
        <input type="text" name="rival" placeholder="Equipo rival" onChange={handleInputChange} />
        <input type="text" name="amount" placeholder="Monto inicial" onChange={handleInputChange} />

        {renderCalendar("📅 Fecha del partido", "matchDate")}
        {renderCalendar("⏱ Inicio de la subasta", "auctionStart")}
        {renderCalendar("🏁 Fin de la subasta", "auctionEnd")}

        <button className="confirm-btn" onClick={handleSubmit}>
          Confirmar subasta
        </button>
      </div>
    </div>
  );
};

export default DashboardForm;








