import React, { useState } from 'react';
import './DashboardForm.css';
import { addJersey } from './jerseys';
import { supabase } from './supabaseClient'; // Ensure Supabase client is configured
import { useDispatch, useSelector } from "react-redux";
import DashboardAside from './DashboardAside';
import DashboardHeader from './DashboardHeader';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AddCardForm from './AddCardForm'
import JerseyAttributes from './JerseyAttributes';
import './AuctionDelivery.css'

const AuctionDelivery = () => {
  const { user } = useSelector((state) => state.auth);
  const [payment, setPayment] = useState(null);  
  const { paymentID } = useParams();
  const [delivery, setDelivery] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    
  const [formData, setFormData] = useState({
    playerName: '',
    jerseyNumber: '',
    rival: '',
    amount: '',
    matchDate: null,
    auctionStart: null,
    auctionEnd: null,
    image: null, // Store the actual File object
    used: false, // New checkbox state
    signed: false, // New checkbox state
    description: '',
    venue: '',
    competition: '',
  });

  const [formDelivery, setFormDelivery] = useState({
    country: '',
    name: '',
    address: '',
    address2: '',
    city: '',
    cp: '',
    state: '',
    phoneNumber: '',

  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calendar state for each date picker
  const [calendarStates, setCalendarStates] = useState({
    matchDate: { currentMonth: new Date(), selectedDate: null },
    auctionStart: { currentMonth: new Date(), selectedDate: null },
    auctionEnd: { currentMonth: new Date(), selectedDate: null }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleInputDeliveryChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormDelivery(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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

  const validateDeliveryForm = () => {
    if (!formDelivery.country.trim()) {
      alert('Por favor ingresa el país.');
      return false;
    }
    if (!formDelivery.name.trim()) {
      alert('Por favor ingresa el nombre completo.');
      return false;
    }
    if (!formDelivery.address.trim()) {
      alert('Por favor ingresa la dirección.');
      return false;
    }
    if (!formDelivery.city.trim()) {
      alert('Por favor ingresa la ciudad.');
      return false;
    }
    if (!formDelivery.cp.trim()) {
      alert('Por favor ingresa el código postal.');
      return false;
    }
    if (!formDelivery.state.trim()) {
      alert('Por favor ingresa el estado.');
      return false;
    }
    if (!formDelivery.phoneNumber.trim()) {
      alert('Por favor ingresa el número de celular.');
      return false;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(formDelivery.phoneNumber)) {
      alert('Por favor ingresa un número de celular válido.');
      return false;
    }

    // Validate postal code (basic validation - should be numeric)
    if (isNaN(formDelivery.cp) || formDelivery.cp.length < 3) {
      alert('Por favor ingresa un código postal válido.');
      return false;
    }

    return true;
  };

  const handleDeliverySubmit = () => {
    if (!validateDeliveryForm()) return;
    
    console.log(formDelivery);
    setDelivery(formDelivery);
  };

  const processDeliveryPayment = async () => {
    try {
      // Get current session token
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.session?.access_token) {
        throw new Error('No se pudo autenticar. Por favor, inicia sesión nuevamente.');
      }

      // Prepare delivery address string
      const deliveryAddress = [
        formDelivery.name,
        formDelivery.address,
        formDelivery.address2,
        `${formDelivery.cp}, ${formDelivery.city}, ${formDelivery.state}`,
        formDelivery.country,
        `Tel: ${formDelivery.phoneNumber}`
      ].filter(Boolean).join(', ');

      // Call the edge function to process delivery payment
      const response = await fetch(
        "https://tlhejbmdwowbhcyviydm.functions.supabase.co/processDeliveryPayment", // Update this URL to your actual edge function URL
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            payment_id: paymentID,
            delivery_address: deliveryAddress
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error("Edge function error:", data);
        throw new Error(data.error || "Error al procesar el pago de envío");
      }

      return data;
    } catch (error) {
      console.error('Error processing delivery payment:', error);
      throw error;
    }
  };

  const handlePaymentSubmit = async () => {
    // Validation 1: Check if delivery is set
    if (!delivery) {
      alert('Por favor completa y guarda la información de envío antes de proceder con el pago.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Validation 2: Check if user has a payment method
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('default_payment_method_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        alert('Error al verificar tu información de pago. Por favor intenta de nuevo.');
        return;
      }

      if (!profile?.default_payment_method_id) {
        alert('Necesitas registrar un método de pago antes de proceder. Por favor agrega una tarjeta de crédito.');
        return;
      }

      // Process the delivery payment
      const paymentResult = await processDeliveryPayment();
      
      if (paymentResult.success) {
        alert('¡Pago de envío procesado exitosamente! Tu pedido será enviado pronto.');
        // Optionally navigate to a success page or back to dashboard
        // navigate('/dashboard');
      } else {
        throw new Error('Error en el procesamiento del pago');
      }

    } catch (error) {
      console.error('Payment error:', error);
      alert(error.message || 'Error al procesar el pago. Por favor intenta de nuevo.');
    } finally {
      setIsProcessingPayment(false);
    }
  };


  useEffect(() => {
      const fetchPaymentData = async () => {
        try {
          const { data: paymentData, error } = await supabase
            .from('payments')
            .select(`
              payment_id,
              auction_id,
              bidder_id,
              auctions (
                jerseys(
                  player_name,
                  jersey_number,
                  image_url,
                  used,
                  signed
                )
              )
              
            `)
            .eq('payment_id', paymentID); // Filter by auction ID
    
          if (error) {
            console.error('Error fetching auction data:', error.message);
            return;
          }
    
          if (!paymentData || paymentData.length === 0) {
            console.warn('No auctions found for this jersey.');
            console.log('No auctions found for this jersey.');
            setPayment(null);
            return;
          }
  
  
          // Merge auction-level data with nested jersey data
          const selectedAuction = paymentData[0];
          setPayment(selectedAuction); // Set the merged data
          console.log(payment);
          console.debug('Merged Auction Data:', selectedAuction);
        } catch (err) {
          console.error('Unexpected error fetching auction data:', err);
        }
      };
    
      fetchPaymentData();
    }, [paymentID]);


    const formatCurrency = (amount) =>
      amount?.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return (
    <div className="dashboard-form-wrapper">
      <DashboardHeader name={`${user.full_name}`}/>
      <div className="dashboard-body animate-fade-in">
        <DashboardAside />
        
        {payment && (
          <div className='payment'>
          <div className='delivery-header'>
          <div className='delivery-header-info'>
            <h1 className='delivey-player-name'>{payment.auctions.jerseys.player_name}</h1>
            <JerseyAttributes jersey={payment.auctions.jerseys}/>
          </div>
          <hr></hr>
        </div>
          <div className='form-body-payment'>
            
            <div className="image-and-ammount">
            <div className="ammount-envio">
                                          <div className='resumen-info'>
                          <h4 className="resumen-title">RESUMEN DEL ENVÍO</h4>
                          <div className="resumen-line">
                            <span>SUBTOTAL: </span>
                            <span>{formatCurrency(20)}</span>
                          </div>
                          <div className="resumen-line">
                            <span>IVA: </span>
                            <span>{formatCurrency(20 * 0.16)}</span>
                          </div>
                          <div className="resumen-line total">
                            <span>TOTAL: </span>
                            <span>{formatCurrency(20 * 1.16)}</span>
                          </div>
                          </div>
                        </div>
                  <img 
                    src={payment.auctions.jerseys.image_url} 
                    alt="Vista previa" 
                    className="image-envio" 
                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                  />
                  
              </div>
            <div className="form-content-wrapper">
                {!delivery &&( 

              <div className='form-content'>
                <input 
                  type="text" 
                  name="country" 
                  placeholder="País*" 
                  value={formDelivery.country}
                  onChange={handleInputDeliveryChange}
                  className='dashboard-input'
                />

                <input 
                  type="text" 
                  name="name" 
                  placeholder="Nombre completo*" 
                  value={formDelivery.name}
                  onChange={handleInputDeliveryChange}
                  className='dashboard-input'
                />

                <input 
                  type="text" 
                  name="address" 
                  placeholder="Dirección*" 
                  value={formDelivery.address}
                  onChange={handleInputDeliveryChange}
                  className='dashboard-input'
                />
                <input 
                  type="text" 
                  name="address2" 
                  placeholder="Dirección 2" 
                  value={formDelivery.address2}
                  onChange={handleInputDeliveryChange}
                  className='dashboard-input'
                />
                <div className='form-2columns'>
                  <input 
                    type="text" 
                    name="city" 
                    placeholder="Ciudad*" 
                    value={formDelivery.city}
                    onChange={handleInputDeliveryChange}
                    className='dashboard-input'
                  />
                  <input 
                    type="number" 
                    name="cp" 
                    placeholder="Código Postal*" 
                    value={formDelivery.cp}
                    onChange={handleInputDeliveryChange}
                    className='dashboard-input'
                  />
                </div>
                
                <input 
                  type="text" 
                  name="state" 
                  placeholder="Estado*" 
                  value={formDelivery.state}
                  onChange={handleInputDeliveryChange}
                  className='dashboard-input'
                />
                <input 
                  type="number" 
                  name="phoneNumber" 
                  placeholder="Número de celular*" 
                  value={formDelivery.phoneNumber}
                  onChange={handleInputDeliveryChange}
                  className='dashboard-input'
                />
                <button className='address-button' 
                onClick={handleDeliverySubmit}>Guardar Dirección</button>
                </div>)}
                {delivery && (
                  <div className='delivery-info-wrapper'>
                  <div className='delivery-info'>
                    <p className='delivery-title'>{formDelivery.name}</p>
                    <p className='delivery-fact'>{formDelivery.address}</p>
                    <p className='delivery-fact'>{formDelivery.cp}, {formDelivery.city}, {formDelivery.country}</p>
                    <p className='delivery-fact'>{formDelivery.phoneNumber}</p>
                  </div>
                  <p className='delivery-update' onClick={()=>{setDelivery(null)}}>Actualizar</p>
                  </div>
                )}

              <AddCardForm bidBanner={false}/>
            
              
            </div>
            
            </div>
            <button 
              className='payment-button'
              onClick={handlePaymentSubmit}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? 'PROCESANDO PAGO...' : 'Realizar Pago'}
            </button>
            </div>
        )}
          

          
      </div>
    </div>
  );
};

export default AuctionDelivery;