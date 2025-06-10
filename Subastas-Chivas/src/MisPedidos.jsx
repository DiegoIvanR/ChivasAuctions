import React, { useState, useEffect } from 'react';
import './MisPedidos.css';
import { useSelector } from 'react-redux';
import DashboardAside from './DashboardAside';
import JerseyCard from './JerseyCard';
import { supabase } from './supabaseClient';

const MisPedidos = () => {
  const user = useSelector((state) => state.auth.user);
  const [pedidosEnCamino, setPedidosEnCamino] = useState([]);
  const [pedidosEntregados, setPedidosEntregados] = useState([]);
  const [filter, setFilter] = useState('EN CAMINO');

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
              auctions (
                jersey_id,
                start_time,
                end_time,
                starting_bid,
                jerseys (
                  player_name,
                  jersey_number,
                  image_url,
                  used,
                  signed
                )
              ) 
            `)
            .eq('bidder_id', user.id);

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching pedidos:', error.message);
          return;
        }

        const enCamino = [];
        const entregados = [];
        data.forEach((row) => {
          
            if (row.delivered === false) {
              console.log('Pedido en camino:', row);
              enCamino.push(row);
            } else if (row.delivered === true) {
              console.log('Pedido entregado:', row);
              entregados.push(row);
            }
    
        });

        setPedidosEnCamino(enCamino);
        setPedidosEntregados(entregados);
      } catch (err) {
        console.error('Unexpected error fetching pedidos:', err);
      }
    };

    fetchPedidos();
  }, [user]);

  const pedidosToDisplay = filter === 'EN CAMINO' ? pedidosEnCamino : pedidosEntregados;

  const formatCurrency = (amount) =>
    amount?.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-overlay"></div>
      <div className="dashboard-content animate-fade-in">
        <div className="dashboard-buffer" style={{ height: '80px' }}></div>

        <main className="dashboard-main">
          <h1 className="dashboard-title dashboard-title--pedidos">{user.full_name}</h1>
          <hr className="dashboard-divider" />

          <div className="mispedidos-filters">
            <button className={filter === 'EN CAMINO' ? 'active' : ''} onClick={() => setFilter('EN CAMINO')}>EN CAMINO</button>
            <button className={filter === 'ENTREGADOS' ? 'active' : ''} onClick={() => setFilter('ENTREGADOS')}>ENTREGADOS</button>
          </div>

          <div className="dashboard-body dashboard-body--pedidos">
            <DashboardAside />

            <section className="dashboard-section dashboard-section--pedidos">
              {pedidosToDisplay.length === 0 ? (
                <p>No hay subastas {filter.toLowerCase()} disponibles.</p>
              ) : (
                pedidosToDisplay.map((jersey) => (
                  <div key={jersey.auction_id} className="pedido-card-horizontal">
                    <JerseyCard jersey={jersey} filter="GANADAS" />
                    <div className="resumen-envio">
                      <h4 className="resumen-title">RESUMEN DEL ENVÍO</h4>
                      <div className="resumen-line">
                        <span>SUBTOTAL: </span>
                        <span>{formatCurrency(jersey.auctions.starting_bid)}</span>
                      </div>
                      <div className="resumen-line">
                        <span>IVA: </span>
                        <span>{formatCurrency(jersey.auctions.starting_bid * 0.16)}</span>
                      </div>
                      <div className="resumen-line total">
                        <span>TOTAL: </span>
                        <span>{formatCurrency(jersey.auctions.starting_bid * 1.16)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MisPedidos;