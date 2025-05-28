import React, { useState } from 'react';
import './CalendarSelector.css';

const CalendarSelector = () => {
  const [selectedDate, setSelectedDate] = useState(null);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="calendar-container">
      <div className="calendar">
        <h2 className="calendar-title">Select date</h2>
        <h1 className="calendar-date">Mon, Aug 17</h1>
        <hr className="calendar-divider" />
        <div className="calendar-header">
          <span className="calendar-month">August 2025</span>
          <div className="calendar-nav">
            <span className="arrow">&#x276E;</span>
            <span className="arrow">&#x276F;</span>
          </div>
        </div>
        <div className="calendar-grid">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <div className="calendar-day-name" key={`day-${index}`}>{day}</div>
          ))}
          {calendarDays.map((day, index) => (
            <div
              key={`cell-${index}`}
              className={`calendar-day ${selectedDate === day ? 'selected' : ''}`}
              onClick={() => day && setSelectedDate(day)}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-actions">
          <button className="cancel-button">Cancel</button>
          <button className="ok-button">OK</button>
        </div>
      </div>
    </div>
  );
};

export default CalendarSelector;
