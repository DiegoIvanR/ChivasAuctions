import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DoorCarousel from './DoorCarousel';
import Header from './Header';
import Footer from './Footer';
import LockerRoomSearch from './LockerRoomSearch';

const App = () => {
  return (
    <div className="App">
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<DoorCarousel/>} />
          <Route path="/auction/:auctionID" element={<LockerAuction />} />
          <Route path="/locker-room-search" element={<LockerRoomSearch />} />
          <Route path="/dashboard" element={<DashboardForm />} /> {/* Add this line */}
        </Routes>
        <Footer />
      </Router>
    </div>
  );
};

export default App;
