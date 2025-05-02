import React from 'react';
import ReactDOM from 'react-dom';

import Header from './Header.jsx';
import DoorCarousel from './DoorCarousel.jsx';
import LockerRoom from './LockerRoom.jsx';
import Footer from './Footer.jsx';

function App() {
  return (
    <div className="App">
      <Header/>
      <LockerRoom/>
      <Footer/>
    </div>
  );
}

export default App;