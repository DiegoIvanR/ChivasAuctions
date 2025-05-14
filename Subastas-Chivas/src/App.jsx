import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DoorCarousel from './DoorCarousel';
import LockerRoom from './LockerRoom';
import Header from './Header';
import Footer from './Footer';
import LockerRoomSearch from './LockerRoomSearch';

const App = () => {
  return (
    <div className="App">
      <Router>
        <Header /> {/* Move Header inside Router */}
        <Routes>
          <Route path="/" element={<DoorCarousel />} />
          <Route path="/locker-room" element={<LockerRoom />} />
          <Route path="/locker-room-search" element={<LockerRoomSearch />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
};

export default App;