import React, { useState, useEffect } from 'react';
import './MisPedidos.css';
import { useSelector } from 'react-redux';
import DashboardAside from './DashboardAside';
import JerseyCard from './JerseyCard';
import { supabase } from './supabaseClient';
import DashboardHeader from './DashboardHeader';
import JerseyAttributes from './JerseyAttributes';
import { useNavigate } from 'react-router-dom';

const MisPedidos = () => {
  const user = useSelector((state) => state.auth.user);
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [pedidosEnCamino, setPedidosEnCamino] = useState([]);
  const [pedidosEntregados, setPedidosEntregados] = useState([]);
  const [filter, setFilter] = useState('PENDIENTES');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!user) return;

      try {
        let query = supabase
        .from('payments')
            .select(`
              payment_id,
              auction_id,
              bidder_id,
              delivered,
              amount_charged,
              stripe_delivery_payment_id,
              auctions (
                jersey_id,
                start_time,
                end_time,
                jerseys (
                  player_name,
                  jersey_number,
                  image_url,
                  used,
                  signed,
                  matches (
                    opponent,
                    match_date
                  )
                )
              ) 
            `)
            .eq('bidder_id', user.id);

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching pedidos:', error.message);
          return;
        }

        const pendientes = [];
        const enCamino = [];
        const entregados = [];
        
        data.forEach((row) => {
          if (row.stripe_delivery_payment_id === null) {
            console.log('Pedido pendiente:', row);
            pendientes.push(row);
          } else if (row.stripe_delivery_payment_id !== null && row.delivered === false) {
            console.log('Pedido en camino:', row);
            enCamino.push(row);
          } else if (row.stripe_delivery_payment_id !== null && row.delivered === true) {
            console.log('Pedido entregado:', row);
            entregados.push(row);
          }
        });

        setPedidosPendientes(pendientes);
        setPedidosEnCamino(enCamino);
        setPedidosEntregados(entregados);
      } catch (err) {
        console.error('Unexpected error fetching pedidos:', err);
      }
    };

    fetchPedidos();
  }, [user]);

  const getPedidosToDisplay = () => {
    switch (filter) {
      case 'PENDIENTES':
        return pedidosPendientes;
      case 'EN CAMINO':
        return pedidosEnCamino;
      case 'ENTREGADOS':
        return pedidosEntregados;
      default:
        return pedidosPendientes;
    }
  };

  const pedidosToDisplay = getPedidosToDisplay();

  const formatCurrency = (amount) =>
    amount?.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const formatDate = (isoString) => {
      if (!isoString) return "N/A";
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}/${month}/${day}`;
    };

    const handlePaymentClick = (jersey) => {
        console.log(jersey)
        navigate(`/delivery-payment/${jersey.payment_id}`);
    };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-overlay"></div>
      <div className="dashboard-content animate-fade-in">
        <main className="dashboard-main">
          <DashboardHeader name={user.full_name}/>

          <div className="dashboard-body dashboard-body--pedidos">
            <DashboardAside />
            <div className='mispujas-body-content'>
              <div className="mispedidos-filters">
                <button 
                  className={filter === 'PENDIENTES' ? 'active' : ''} 
                  onClick={() => setFilter('PENDIENTES')}
                >
                  PENDIENTES
                </button>
                <button 
                  className={filter === 'EN CAMINO' ? 'active' : ''} 
                  onClick={() => setFilter('EN CAMINO')}
                >
                  EN CAMINO
                </button>
                <button 
                  className={filter === 'ENTREGADOS' ? 'active' : ''} 
                  onClick={() => setFilter('ENTREGADOS')}
                >
                  ENTREGADOS
                </button>
              </div>
              <section className="dashboard-section--pedidos">
                <div className='dashboard-pedidos'>
                  {pedidosToDisplay.length === 0 ? (
                    <p>No hay jerseys {filter.toLowerCase()} disponibles.</p>
                  ) : (
                    pedidosToDisplay.map((jersey) => (
                      <div key={jersey.auction_id} className="pedido-card-horizontal">
                        <div className="auction-card" key={jersey.auctions.jersey_id}>
                                        <img
                                          src={jersey.auctions?.jerseys?.image_url}
                                          alt={`Jersey de ${jersey.player_name}`}
                                          className="jersey-image"
                                        />
                                        <div className="auction-dash-info">
                                          <div className="auction-dash-player">
                                            <p className="auction-dash-name">{jersey.auctions.jerseys.player_name || "Desconocido"}</p>
                                            <p className="auction-dash-jersey">#{jersey.auctions.jerseys.jersey_number || "N/A"}</p>
                                          </div>
                                          <p className="auction-dash-id">ID: {jersey.auction_id || "N/A"}</p>
                                          <p className="auction-dash-stbid">Pago: {jersey.amount_charged ? `${jersey.amount_charged} USD` : "N/A"}</p>
                        
                                          <div className="auction-dash-match">
                                            <p className="auction-dash-opponent">VS {jersey.auctions.jerseys.matches.opponent || "N/A"}</p>
                                            <p className="auction-dash-date">{jersey.auctions.jerseys.matches?.match_date || "N/A"}</p>
                                          </div>
                                          <JerseyAttributes jersey={jersey.auctions?.jerseys} />
                                          
                                          <p className="auction-dash-start">
                                            Inicio: {formatDate(jersey.auctions?.start_time)}
                                          </p>
                                          <p className="auction-dash-end">
                                            Fin: {formatDate(jersey.auctions?.end_time)}
                                          </p>
                                        </div>
                                        <div className="resumen-envio">
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
                          {filter === 'PENDIENTES' && (
                            <button className='proceed-button' onClick={() => handlePaymentClick(jersey)}>
                              Proceder al Pago
                            </button>
                          )}
                          {filter === 'EN CAMINO' && (
                            <div className="status-indicator">
                              <span className="resumen-line">PAGADO: EN CAMINO</span>
                            </div>
                          )}
                          {filter === 'ENTREGADOS' && (
                            <div className="status-indicator delivered">
                              <span className="resumen-line">PAGADO: ENTREGADO</span>
                            </div>
                          )}
                        </div>
                                      </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MisPedidos;