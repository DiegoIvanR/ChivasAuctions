import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DoorCarousel from './DoorCarousel';
import LockerRoom from './LockerRoom';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DoorCarousel />} />
        <Route path="/locker-room" element={<LockerRoom />} />
      </Routes>
    </Router>
  );
};

export default App;