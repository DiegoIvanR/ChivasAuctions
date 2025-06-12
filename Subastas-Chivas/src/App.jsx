import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DoorCarousel from './DoorCarousel';
import Header from './Header';
import Footer from './Footer';
import LockerRoomSearch from './LockerRoomSearch';
import LockerAuction from './LockerAuction';
import CalendarSelector from './CalendarSelector';
import DashboardUsuario from './DashboardUsuario';
import DashboardForm from './DashboardForm';
import Login from './Login';
import SignUp from './SignUp';
import Confirmation from './Confirmation';
import MisPujas from './MisPujas';
import MisPedidos from './MisPedidos';
import AdminDashboard from "./AdminDashboard";

import { StripeProvider } from "./stripeProvider";
import AddCardForm from "./AddCardForm";
import PaymentMethodGuard from "./PaymentMethodGuard";
import Ajustes from "./Ajustes";
import { Provider } from 'react-redux';
import store from './store';
import NotFound from './NotFound';

import AuctionDelivery from './AuctionDelivery';
/*
guard:
                  <PaymentMethodGuard requirePaymentMethod={true}>
                    <LockerAuction />
                  </PaymentMethodGuard>
*/
const App = () => {
  return (
    <div className="App">
      <StripeProvider>
        <Provider store={store}>
          <Router>
            <Header />
            <Routes>
              {/* Public routes - no payment method required */}
              <Route path="/dashboard" element={<DashboardForm />} />
              <Route path="/" element={<DoorCarousel />} />
              <Route path="/locker-room-search" element={<LockerRoomSearch />} />
              <Route path="/calendar" element={<CalendarSelector />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/confirmation" element={<Confirmation />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/dashboardUsuario/ajustes" element={<Ajustes />} />
              {/* Payment setup route */}
              <Route path="/add-card" element={<AddCardForm />} />
              <Route path="/delivery-payment/:paymentID" element={<AuctionDelivery/>} />
              
              {/* Protected routes - require payment method for bidding */}
              <Route 
                path="/auction/:auctionID" 
                element={<LockerAuction />} 
              />
              
              {/* Dashboard routes - require payment method for bid management */}
              <Route 
                path="/dashboardUsuario" 
                element={
                    <DashboardUsuario />
                } 
              />
              
              <Route 
                path="/dashboardUsuario/MisPujas" 
                element={
                    <MisPujas />
                } 
              />
                  
              <Route path="/dashboardUsuario/MisPedidos" element={<MisPedidos />} />
              
              {/* Form routes - optional payment method */}
              <Route path="/dashboardForm" element={<DashboardForm />} />
              <Route path="/dashboard" element={<DashboardForm />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
            <Footer />
          </Router>
        </Provider>
      </StripeProvider>
    </div>
  );
};

export default App;