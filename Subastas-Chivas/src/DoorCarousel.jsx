// DoorCarousel.jsx
import React, { useState, useEffect } from 'react';
import { matches } from './matches.js'; // Import the matches data
import ArrowButton from './ArrowButton'; // Import the ArrowButton component
import Door from './Door'; // Import the Door component

const DoorCarousel = () => {
  const [doors, setDoors] = useState([
    { id: 0, team: '' },
    matches.america_15_05_2025,
    matches.pumas_16_05_2025,
    matches.rayados_17_05_2025,
    { id: 4, team: 'Chivas' },
    { id: 5, team: '' }
  ]);
  
  const [startIndex, setStartIndex] = useState(0);
  const [selectedDoor, setSelectedDoor] = useState(null);
  
  // Render all doors, not just visible ones
  // This is important for smooth transitions
  
  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1); // Slide to the left
    }
  };
  
  const handleNext = () => {
    if (startIndex < doors.length - 3) {
      setStartIndex(startIndex + 1); // Slide to the right
    }
  };
  
  const handleDoorClick = (doorId) => {
    setSelectedDoor(doorId);
  };
  
  return (
    <div className="carousel-container">
      <img src="../public/top-door-frame.png" className="top-door-frame" alt="Top door frame" />
      <div className="carousel-controls">
        <div className='door-frames'>
          <img src="../public/right-door-frame.png" className="door-frame" alt="Left door frame" />
          <img src="../public/right-door-frame.png" className="door-frame" alt="Right door frame" />
        </div>
        
        {/* Sliding doors container - render ALL doors, not just visible ones */}
        <div 
          className="door-list"
          style={{
            transform: `translateX(calc(50% - ${startIndex * 510}px - 765px))`, // Center the doors and adjust for sliding
          }}
        >
          {doors.map((door) => (
            <div key={door.id} className="door-wrapper">
              <Door
                door={door}
                onClick={handleDoorClick}
                isSelected={selectedDoor === door.id}
              />
            </div>
          ))}
        </div>
        
        {/* Arrow buttons */}
        <div className="arrow-buttons">
          <ArrowButton
            direction="left"
            onClick={handlePrev}
            disabled={startIndex === 0}
          />
          <ArrowButton
            direction="right"
            onClick={handleNext}
            disabled={startIndex >= doors.length - 3}
          />
        </div>
      </div>
      
      {selectedDoor && (
        <div className="selected-message">
          You selected Door {selectedDoor}!
        </div>
      )}
    </div>
  );
};

export default DoorCarousel;


/*
// Date Picker Component
const DatePicker = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  
  const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const today = new Date();
  const [viewDate, setViewDate] = useState({
    month: today.getMonth(),
    year: today.getFullYear()
  });
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const generateCalendarDays = () => {
    const days = [];
    const firstDay = new Date(viewDate.year, viewDate.month, 1).getDay();
    const daysCount = daysInMonth(viewDate.month, viewDate.year);
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    // Add days of month
    for (let i = 1; i <= daysCount; i++) {
      const dateStr = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push(
        <div 
          key={`day-${i}`}
          onClick={() => {
            setSelectedDate(dateStr);
            setShowCalendar(false);
          }}
          className={`h-8 w-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-200 
            ${selectedDate === dateStr ? 'bg-blue-500 text-white' : ''}`}
        >
          {i}
        </div>
      );
    }
    
    return days;
  };
  
  const prevMonth = () => {
    setViewDate(prev => {
      if (prev.month === 0) {
        return { month: 11, year: prev.year - 1 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };
  
  const nextMonth = () => {
    setViewDate(prev => {
      if (prev.month === 11) {
        return { month: 0, year: prev.year + 1 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };
  
  return (
    <div className="mb-8 relative">
      <h2 className="text-xl font-bold mb-4">Date Picker</h2>
      <div className="flex">
        <input 
          type="text" 
          readOnly 
          value={selectedDate} 
          placeholder="Select a date"
          onClick={() => setShowCalendar(!showCalendar)}
          className="border p-2 rounded-lg cursor-pointer w-full"
        />
        <button 
          onClick={() => setShowCalendar(!showCalendar)}
          className="ml-2 bg-gray-200 p-2 rounded-lg"
        >
          <Calendar size={20} />
        </button>
      </div>
      
      {showCalendar && (
        <div className="absolute z-10 mt-2 bg-white rounded-lg shadow-lg border p-3 w-72">
          <div className="flex justify-between items-center mb-2">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-200 rounded">
              &lt;
            </button>
            <div>{monthNames[viewDate.month]} {viewDate.year}</div>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-200 rounded">
              &gt;
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-sm font-semibold">{day}</div>
            ))}
            {generateCalendarDays()}
          </div>
        </div>
      )}
    </div>
  );
};

// DateTime Picker Component
const DateTimePicker = () => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('12:00');
  
  const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const today = new Date();
  const [viewDate, setViewDate] = useState({
    month: today.getMonth(),
    year: today.getFullYear()
  });
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const generateCalendarDays = () => {
    const days = [];
    const firstDay = new Date(viewDate.year, viewDate.month, 1).getDay();
    const daysCount = daysInMonth(viewDate.month, viewDate.year);
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    // Add days of month
    for (let i = 1; i <= daysCount; i++) {
      const dateStr = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push(
        <div 
          key={`day-${i}`}
          onClick={() => setSelectedDate(dateStr)}
          className={`h-8 w-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-200 
            ${selectedDate === dateStr ? 'bg-blue-500 text-white' : ''}`}
        >
          {i}
        </div>
      );
    }
    
    return days;
  };
  
  const prevMonth = () => {
    setViewDate(prev => {
      if (prev.month === 0) {
        return { month: 11, year: prev.year - 1 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };
  
  const nextMonth = () => {
    setViewDate(prev => {
      if (prev.month === 11) {
        return { month: 0, year: prev.year + 1 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };
  
  // Generate hours for select
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(String(i).padStart(2, '0'));
  }
  
  // Generate minutes for select
  const minutes = [];
  for (let i = 0; i < 60; i += 5) {
    minutes.push(String(i).padStart(2, '0'));
  }
  
  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };
  
  const confirmDateTime = () => {
    setShowPicker(false);
  };
  
  const formattedDateTime = selectedDate && selectedTime ? 
    `${selectedDate} ${selectedTime}` : '';
  
  return (
    <div className="relative">
      <h2 className="text-xl font-bold mb-4">Date & Time Picker</h2>
      <div className="flex">
        <input 
          type="text" 
          readOnly 
          value={formattedDateTime} 
          placeholder="Select date and time"
          onClick={() => setShowPicker(!showPicker)}
          className="border p-2 rounded-lg cursor-pointer w-full"
        />
        <button 
          onClick={() => setShowPicker(!showPicker)}
          className="ml-2 bg-gray-200 p-2 rounded-lg"
        >
          <Clock size={20} />
        </button>
      </div>
      
      {showPicker && (
        <div className="absolute z-10 mt-2 bg-white rounded-lg shadow-lg border p-3 w-80">
          <div className="flex justify-between items-center mb-2">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-200 rounded">
              &lt;
            </button>
            <div>{monthNames[viewDate.month]} {viewDate.year}</div>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-200 rounded">
              &gt;
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-4">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-sm font-semibold">{day}</div>
            ))}
            {generateCalendarDays()}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Time:</label>
            <input
              type="time"
              value={selectedTime}
              onChange={handleTimeChange}
              className="border p-2 rounded w-full"
            />
          </div>
          
          <button 
            onClick={confirmDateTime} 
            disabled={!selectedDate}
            className="bg-blue-500 text-white py-2 px-4 rounded w-full disabled:bg-gray-300"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
};
*/