import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DoorCarousel from './DoorCarousel';
import Header from './Header';
import Footer from './Footer';
import LockerRoomSearch from './LockerRoomSearch';
import LockerAuction from './LockerAuction';
import CalendarSelector from './CalendarSelector';
import DashboardUsuario from './DashboardUsuario';
import PaymentSetup from './PaymentSetup'; // Import the PaymentSetup component
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import DashboardForm from './DashboardForm';
import Login from './Login'; // Import the Login component
import { Provider } from 'react-redux';
import store from './store';
import SignUp from './SignUp'; // Import the SignUp component
import Confirmation from './Confirmation';
/*import LockerRoom from './LockerRoom';*/


// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51RTkCSBSXB0u2ceFU5ZzPmsrITQPFU3ALvjt2r1rN8ov7fcM5j4YKKqUh4RXFiB5p2UsPVfee9U40oFIaVTapInu0068ksRGdk'); // Replace with your Stripe publishable key

const App = () => {
  return (
    <div className="App">
      <Provider store={store}>
      <Router>
        <Header /> {/* Move Header inside Router */}
        <Routes>
          <Route path="/" element={<DoorCarousel />} />
          <Route path="/auction/:auctionID" element={<LockerAuction />} />
          <Route path="/locker-room-search" element={<LockerRoomSearch />} />
          <Route path="/calendar" element={<CalendarSelector />} />
          <Route path="/dashboardUsuario" element={<DashboardUsuario />} />
          <Route path="/login" element={<Login />} /> {/* Add this line */}
          <Route path="/signup" element={<SignUp />} /> {/* Add this line */}
          <Route path="/confirmation" element={<Confirmation />} />
          <Route
            path="/payment-setup"
            element={
              <Elements stripe={stripePromise}>
                <PaymentSetup />
              </Elements>
            }
          />
          <Route path="/dashboard" element={<DashboardForm />} /> {/* Add this line */}
        </Routes>
        <Footer />
      </Router>
      </Provider>
    </div>
  );
};

export default App;