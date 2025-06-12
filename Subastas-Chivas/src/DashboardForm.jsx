import React, { useState } from 'react';
import './DashboardForm.css';
import { addJersey } from './jerseys';
import { supabase } from './supabaseClient'; // Ensure Supabase client is configured
import { useDispatch, useSelector } from "react-redux";
import DashboardAside from './DashboardAside';
import DashboardHeader from './DashboardHeader';
const DashboardForm = () => {
    const { user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    playerName: '',
    jerseyNumber: '',
    rival: '',
    amount: '',
    matchDate: null,
    auctionStart: null,
    auctionEnd: null,
    image: null, // Store the actual File object
    used: false, // New checkbox state
    signed: false, // New checkbox state
    description: '',
    venue: '',
    competition: '',
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calendar state for each date picker
  const [calendarStates, setCalendarStates] = useState({
    matchDate: { currentMonth: new Date(), selectedDate: null },
    auctionStart: { currentMonth: new Date(), selectedDate: null },
    auctionEnd: { currentMonth: new Date(), selectedDate: null }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido.');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Por favor selecciona una imagen menor a 5MB.');
        return;
      }

      // Store the file object
      setFormData(prev => ({ ...prev, image: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDateSelect = (calendarType, date) => {
    setFormData(prev => ({
      ...prev,
      [calendarType]: date
    }));
    
    setCalendarStates(prev => ({
      ...prev,
      [calendarType]: {
        ...prev[calendarType],
        selectedDate: date
      }
    }));
  };

  const changeMonth = (calendarType, direction) => {
    setCalendarStates(prev => {
      const current = prev[calendarType].currentMonth;
      const newDate = new Date(current.getFullYear(), current.getMonth() + direction, 1);
      return {
        ...prev,
        [calendarType]: {
          ...prev[calendarType],
          currentMonth: newDate
        }
      };
    });
  };

  const formatSelectedDate = (date) => {
    if (!date) return 'Seleccione una fecha';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const CustomCalendar = ({ title, calendarType, includeTime = false }) => {
    const calendarState = calendarStates[calendarType];
    const currentMonth = calendarState.currentMonth;
    const selectedDate = calendarState.selectedDate;
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Generate calendar days
    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }

    const isSelected = (day) => {
      if (!selectedDate || !day) return false;
      return selectedDate.getDate() === day &&
             selectedDate.getMonth() === month &&
             selectedDate.getFullYear() === year;
    };

    const handleDayClick = (day) => {
      if (!day) return;
      
      let newDate;
      if (includeTime && selectedDate) {
        // Preserve time if it's a datetime picker
        newDate = new Date(year, month, day, selectedDate.getHours(), selectedDate.getMinutes());
      } else {
        newDate = new Date(year, month, day);
      }
      
      handleDateSelect(calendarType, newDate);
    };

    const handleTimeChange = (e) => {
      if (!selectedDate) return;
      
      const [hours, minutes] = e.target.value.split(':');
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(hours), parseInt(minutes));
      handleDateSelect(calendarType, newDate);
    };

    return (
      <div className="custom-calendar">
        <div className='calendar-title'>{title}</div>
        <div className="calendar-header">
          <div className="selected-date-display">
            {formatSelectedDate(selectedDate)}
          </div>
        </div>
        
        <div className="calendar-body">
          <div className="calendar-nav">
            <span className="calendar-month-year">
              {monthNames[month]} {year}
            </span>
            <div className="nav-arrows">
              <button 
                type="button"
                onClick={() => changeMonth(calendarType, -1)} 
                className="nav-arrow"
              >
                &#8249;
              </button>
              <button 
                type="button"
                onClick={() => changeMonth(calendarType, 1)} 
                className="nav-arrow"
              >
                &#8250;
              </button>
            </div>
          </div>
          
          <div className="calendar-grid">
            <div className="day-headers">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="day-header">{day}</div>
              ))}
            </div>
            
            <div className="days-grid">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`calendar-day ${day ? 'clickable' : ''} ${isSelected(day) ? 'selected' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
          
          {includeTime && selectedDate && (
            <div className="time-picker">
              <input
                type="time"
                value={`${selectedDate.getHours().toString().padStart(2, '0')}:${selectedDate.getMinutes().toString().padStart(2, '0')}`}
                onChange={handleTimeChange}
                className="time-input"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const validateForm = () => {
    if (!formData.playerName.trim()) {
      alert('Por favor ingresa el nombre del jugador.');
      return false;
    }
    if (!formData.jerseyNumber.trim()) {
      alert('Por favor ingresa el número de la playera.');
      return false;
    }
    if (!formData.rival.trim()) {
      alert('Por favor ingresa el equipo rival.');
      return false;
    }
    if (!formData.amount.trim() || isNaN(parseFloat(formData.amount))) {
      alert('Por favor ingresa un monto inicial válido.');
      return false;
    }
    if (!formData.matchDate) {
      alert('Por favor selecciona la fecha del partido.');
      return false;
    }
    if (!formData.auctionStart) {
      alert('Por favor selecciona la fecha de inicio de la subasta.');
      return false;
    }
    if (!formData.auctionEnd) {
      alert('Por favor selecciona la fecha de fin de la subasta.');
      return false;
    }
    if (!formData.image) {
      alert('Por favor sube una imagen de la playera.');
      return false;
    }
    if (!formData.description.trim()) {
      alert('Por favor ingresa una descripción del partido.');
      return false;
    }
    if (!formData.venue.trim()) {
      alert('Por favor ingresa el lugar del partido.');
      return false;
    }
    if (!formData.competition.trim()) {
      alert('Por favor ingresa la competencia.');
      return false;
    }
  
    // Validate date logic
    const auctionStart = formData.auctionStart;
    const auctionEnd = formData.auctionEnd;
    const matchDate = formData.matchDate;
  
    if (auctionStart >= auctionEnd) {
      alert('La fecha de inicio de la subasta debe ser anterior a la fecha de fin.');
      return false;
    }
  
    if (auctionStart < matchDate) {
      alert('La subasta debe iniciar después o el día del partido.');
      return false;
    }
  
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Upload the image to Supabase storage
      const fileExtension = formData.image.name.split('.').pop();
      const imageFileName = `${formData.playerName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.${fileExtension}`;
      
      const { data: storageData, error: storageError } = await supabase.storage
        .from('jersey-images')
        .upload(`jerseys/${imageFileName}`, formData.image, {
          cacheControl: '3600',
          upsert: false,
        });

      if (storageError) {
        console.error('Error uploading image:', storageError.message);
        alert('Error al subir la imagen. Por favor intenta de nuevo.');
        return;
      }

      // Get the public URL for the image
      const { data: { publicUrl } } = supabase.storage
        .from('jersey-images')
        .getPublicUrl(`jerseys/${imageFileName}`);

      // Check if the match already exists in the matches table
      const { data: existingMatch, error: matchError } = await supabase
        .from('matches')
        .select('match_id')
        .eq('opponent', formData.rival)
        .eq('match_date', formData.matchDate.toISOString().split('T')[0])
        .single();

      if (matchError && matchError.code !== 'PGRST116') {
        console.error('Error checking match:', matchError.message);
        alert('Error al verificar el partido. Por favor intenta de nuevo.');
        return;
      }

      let matchId = existingMatch?.match_id;
      
      if (!matchId) {
        // Insert a new match if it doesn't exist
        const { data: newMatch, error: insertMatchError } = await supabase
          .from('matches')
          .insert({
            opponent: formData.rival,
            match_date: formData.matchDate.toISOString().split('T')[0],
            venue: formData.venue,
            competition: formData.competition,
          })
          .select('match_id')
          .single();

        if (insertMatchError) {
          console.error('Error inserting match:', insertMatchError.message);
          alert('Error al crear el partido. Por favor intenta de nuevo.');
          return;
        }

        matchId = newMatch.match_id;
      }

      // Insert the jersey into the jerseys table
      const { data: newJersey, error: jerseyError } = await supabase
        .from('jerseys')
        .insert({
          match_id: matchId,
          player_name: formData.playerName,
          jersey_number: parseInt(formData.jerseyNumber),
          image_url: publicUrl,
          used: formData.used, // Use checkbox value
          signed: formData.signed, // Use checkbox value
          description: formData.description,
        })
        .select('jersey_id')
        .single();

      if (jerseyError) {
        console.error('Error inserting jersey:', jerseyError.message);
        alert('Error al crear la playera. Por favor intenta de nuevo.');
        return;
      }

      const jerseyId = newJersey.jersey_id;

      // Insert the auction
      const { error: auctionError } = await supabase
        .from('auctions')
        .insert({
          start_time: formData.auctionStart.toISOString(),
          end_time: formData.auctionEnd.toISOString(),
          highest_bid: parseFloat(formData.amount),
          starting_bid: parseFloat(formData.amount),
          jersey_id: jerseyId,
          admin_id: user.id,
        });

      if (auctionError) {
        console.error('Error inserting auction:', auctionError.message);
        alert('Error al crear la subasta. Por favor intenta de nuevo.');
        return;
      }

      alert('¡Subasta creada exitosamente!');
      
      // Reset form
      setFormData({
        playerName: '',
        jerseyNumber: '',
        rival: '',
        amount: '',
        matchDate: null,
        auctionStart: null,
        auctionEnd: null,
        image: null,
        used: false,
        signed: false,
      });
      setImagePreview(null);
      setCalendarStates({
        matchDate: { currentMonth: new Date(), selectedDate: null },
        auctionStart: { currentMonth: new Date(), selectedDate: null },
        auctionEnd: { currentMonth: new Date(), selectedDate: null }
      });

    } catch (err) {
      console.error('Unexpected error:', err.message);
      alert('Error inesperado. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-form-wrapper">
      <DashboardHeader name={`${user.full_name}`}/>
      <div className="dashboard-body">
        <DashboardAside />
        
        <div className='form-body'>
        <div className="image-upload">
            <label htmlFor="imageUpload">Subir imagen de la playera:</label>
            <input 
              type="file" 
              id="imageUpload" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
            {imagePreview && (
              <img 
                src={imagePreview} 
                alt="Vista previa" 
                className="image-preview" 
                style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
              />
            )}
          </div>
        <div className="form-content">
          <input 
            type="text" 
            name="playerName" 
            placeholder="Nombre del jugador" 
            value={formData.playerName}
            onChange={handleInputChange}
            className='dashboard-input'
          />
          <input 
            type="number" 
            name="jerseyNumber" 
            placeholder="Número de la playera" 
            value={formData.jerseyNumber}
            onChange={handleInputChange}
            className='dashboard-input'
            min="0"
          />
          <input 
            type="text" 
            name="rival" 
            placeholder="Equipo rival" 
            value={formData.rival}
            onChange={handleInputChange} 
            className='dashboard-input'
          />

          <div className='form-2columns'>
            <CustomCalendar title="Fecha del partido" calendarType="matchDate" />

            <div className='form-column'>
            <input 
            type="number" 
            name="amount" 
            placeholder="Monto inicial" 
            step="0.01"
            value={formData.amount}
            onChange={handleInputChange} 
            className='dashboard-input'
            min="0"
          />
          <input
            type="text"
            name="description" 
            placeholder="Descripción del jersey" 
            value={formData.description}
            onChange={handleInputChange}
            className='dashboard-input'
          />
          <input 
            type="text" 
            name="venue" 
            placeholder="Lugar del partido" 
            value={formData.venue}
            onChange={handleInputChange} 
            className='dashboard-input'
          />
          <input 
            type="text" 
            name="competition" 
            placeholder="Competencia" 
            value={formData.competition}
            onChange={handleInputChange} 
            className='dashboard-input'
          />

          {/* Checkbox section */}
          <div className="checkbox-section">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="used" 
                  checked={formData.used}
                  onChange={handleInputChange}
                  className="custom-checkbox"
                />
                <span className="checkbox-text">Playera usada</span>
              </label>
            </div>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="signed" 
                  checked={formData.signed}
                  onChange={handleInputChange}
                  className="custom-checkbox"
                />
                <span className="checkbox-text">Playera firmada</span>
              </label>
            </div>
            </div>
            
          </div>
          </div>

          {/* Custom Calendar Components */}
          <div className='form-2columns'>
            <CustomCalendar title="Inicio de la subasta" calendarType="auctionStart" includeTime={true} />
            <CustomCalendar title="Fin de la subasta" calendarType="auctionEnd" includeTime={true} />
          </div>
          <button 
            className="confirm-btn" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando subasta...' : 'Confirmar subasta'}
          </button>
        </div>
        
        </div>
          

          
      </div>
    </div>
  );
};

export default DashboardForm;