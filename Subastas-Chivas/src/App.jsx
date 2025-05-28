import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DoorCarousel from './DoorCarousel';
import Header from './Header';
import Footer from './Footer';
import LockerRoomSearch from './LockerRoomSearch';
import LockerAuction from './LockerAuction';
import CalendarSelector from './CalendarSelector';
import DashboardUsuario from './DashboardUsuario';

/*
import LockerRoom from './LockerRoom';

          <Route path="/locker-room" element={<LockerRoom />} />
*/

const App = () => {
  return (
    <div className="App">
      <Router>
        <Header /> {/* Move Header inside Router */}
        <Routes>
          <Route path="/" element={<DoorCarousel/>} />
          <Route path="/auction/:auctionID" element={<LockerAuction />} />
          <Route path="/locker-room-search" element={<LockerRoomSearch />} />
          <Route path="/calendar" element={<CalendarSelector />} />
          <Route path="/dashboard" element={<DashboardUsuario />} />
          <Route path="/" element={<h1 style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Bienvenido a Subastas Chivas</h1>} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
};

export default App;