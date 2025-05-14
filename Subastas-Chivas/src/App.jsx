import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DoorCarousel from './DoorCarousel';
import LockerRoom from './LockerRoom';
import Header from './Header'
import Footer from './Footer'
const App = () => {
  return (
    <div className="App">
      <Header/>
      <Router>
        <Routes>
          <Route path="/" element={<DoorCarousel />} />
          <Route path="/locker-room" element={<LockerRoom />} />
        </Routes>
      </Router>
      <Footer/>
    </div>

  );
};

export default App;