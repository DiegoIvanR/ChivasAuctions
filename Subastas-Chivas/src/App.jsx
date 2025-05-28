import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DoorCarousel from './DoorCarousel';
import Header from './Header';
import Footer from './Footer';
import LockerRoomSearch from './LockerRoomSearch';
import LockerAuction from './LockerAuction';
import PaymentSetup from './PaymentSetup'; // Import the PaymentSetup component
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51RTkCSBSXB0u2ceFU5ZzPmsrITQPFU3ALvjt2r1rN8ov7fcM5j4YKKqUh4RXFiB5p2UsPVfee9U40oFIaVTapInu0068ksRGdk'); // Replace with your Stripe publishable key

const App = () => {
  return (
    <div className="App">
      <Router>
        <Header /> {/* Move Header inside Router */}
        <Routes>
          <Route path="/" element={<DoorCarousel />} />
          <Route path="/auction/:auctionID" element={<LockerAuction />} />
          <Route path="/locker-room-search" element={<LockerRoomSearch />} />
          <Route
            path="/payment-setup"
            element={
              <Elements stripe={stripePromise}>
                <PaymentSetup />
              </Elements>
            }
          />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
};

export default App;