import React, { useState } from 'react';
import './DashboardForm.css';
import { addJersey } from './jerseys';
import { supabase } from './supabaseClient'; // Ensure Supabase client is configured
import { useDispatch, useSelector } from "react-redux";
import DashboardAside from './DashboardAside';

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
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [calendarState, setCalendarState] = useState({
    matchDate: new Date(2025, 5),
    auctionStart: new Date(2025, 5),
    auctionEnd: new Date(2025, 5),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    if (!formData.matchDate?.fullDate) {
      alert('Por favor selecciona la fecha del partido.');
      return false;
    }
    if (!formData.auctionStart?.fullDate) {
      alert('Por favor selecciona la fecha de inicio de la subasta.');
      return false;
    }
    if (!formData.auctionEnd?.fullDate) {
      alert('Por favor selecciona la fecha de fin de la subasta.');
      return false;
    }
    if (!formData.image) {
      alert('Por favor sube una imagen de la playera.');
      return false;
    }

    // Validate date logic
    const now = new Date();
    const auctionStart = formData.auctionStart.fullDate;
    const auctionEnd = formData.auctionEnd.fullDate;
    const matchDate = formData.matchDate.fullDate;

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
        .eq('match_date', formData.matchDate.fullDate.toISOString().split('T')[0])
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
            match_date: formData.matchDate.fullDate.toISOString().split('T')[0],
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
          used: false,
          signed: false,
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
          start_time: formData.auctionStart.fullDate.toISOString(),
          end_time: formData.auctionEnd.fullDate.toISOString(),
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
      });
      setImagePreview(null);

    } catch (err) {
      console.error('Unexpected error:', err.message);
      alert('Error inesperado. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-form-wrapper">
      <DashboardAside />
      <h2 className="dashboard-title">DASHBOARD</h2>

      <div className="form-content">
        <input 
          type="text" 
          name="playerName" 
          placeholder="Nombre del jugador" 
          value={formData.playerName}
          onChange={handleInputChange} 
        />
        <input 
          type="number" 
          name="jerseyNumber" 
          placeholder="Número de la playera" 
          value={formData.jerseyNumber}
          onChange={handleInputChange} 
        />
        <input 
          type="text" 
          name="rival" 
          placeholder="Equipo rival" 
          value={formData.rival}
          onChange={handleInputChange} 
        />
        <input 
          type="number" 
          name="amount" 
          placeholder="Monto inicial" 
          step="0.01"
          value={formData.amount}
          onChange={handleInputChange} 
        />

        {renderCalendar("📅 Fecha del partido", "matchDate")}
        {renderCalendar("⏱ Inicio de la subasta", "auctionStart")}
        {renderCalendar("🏁 Fin de la subasta", "auctionEnd")}
        
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

        <button 
          className="confirm-btn" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando subasta...' : 'Confirmar subasta'}
        </button>
      </div>
    </div>
  );
};

export default DashboardForm;