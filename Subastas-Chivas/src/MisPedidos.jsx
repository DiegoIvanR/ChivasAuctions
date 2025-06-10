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
                highest_bid,
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
                        <span>{formatCurrency(jersey.auctions.highest_bid)}</span>
                      </div>
                      <div className="resumen-line">
                        <span>IVA: </span>
                        <span>{formatCurrency(jersey.auctions.highest_bid * 0.16)}</span>
                      </div>
                      <div className="resumen-line total">
                        <span>TOTAL: </span>
                        <span>{formatCurrency(jersey.auctions.highest_bid * 1.16)}</span>
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




/*
//Me gustaría decir que jala datos de la base de datos pero no tengo npi pero según yo ya 2.0
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
          .from('bids')
          .select(`
            auction_id,
            auctions (
              jersey_id,
              start_time,
              end_time,
              highest_bid,
              estado,
              estado_envio,
              jerseys (
                player_name,
                jersey_number,
                image_url,
                used,
                signed
              )
            )
          `)
          .eq('bidder_id', user.id)
          .eq('estado', 'ganada');

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching pedidos:', error.message);
          return;
        }

        const enCamino = [];
        const entregados = [];

        const uniqueAuctions = new Map();
        data.forEach((bid) => {
          if (bid.auctions && !uniqueAuctions.has(bid.auction_id)) {
            uniqueAuctions.set(bid.auction_id, bid);
            const estadoEnvio = bid.auctions.estado_envio;
            if (estadoEnvio === 'en_camino') {
              enCamino.push(bid);
            } else if (estadoEnvio === 'entregado') {
              entregados.push(bid);
            }
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

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-overlay"></div>
      <div className="dashboard-content animate-fade-in">
        <div className="dashboard-buffer" style={{ height: '80px' }}></div>

        <main className="dashboard-main">
          <h1 className="dashboard-title">{user.full_name}</h1>
          <hr className="dashboard-divider" />

          <div className="mispedidos-filters">
            <button className={filter === 'EN CAMINO' ? 'active' : ''} onClick={() => setFilter('EN CAMINO')}>EN CAMINO</button>
            <button className={filter === 'ENTREGADOS' ? 'active' : ''} onClick={() => setFilter('ENTREGADOS')}>ENTREGADOS</button>
          </div>

          <div className="dashboard-body">
            <DashboardAside />

            <section className="dashboard-section">
              {pedidosToDisplay.length === 0 ? (
                <p>No hay subastas {filter.toLowerCase()} disponibles.</p>
              ) : (
                pedidosToDisplay.map((jersey) => (
                  <JerseyCard key={jersey.auction_id} jersey={jersey} filter="GANADAS" />
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
*/




/*
//Me gustaría decir que jala datos de la base de datos pero no tengo npi

import React, { useState } from 'react';
import { jerseys } from './jerseys';
import './MisPedidos.css';
import { useSelector } from 'react-redux';
import DashboardAside from './DashboardAside';
import JerseyCard from './JerseyCard';

const MisPedidos = () => {
  const user = useSelector((state) => state.auth.user);

  const [filtroActivo, setFiltroActivo] = useState('enCamino');

  // Filtrar jerseys dependiendo del usuario
  const pedidosUsuario = jerseys.filter(jersey => jersey.usuario === user.email); //Me lo dio chat pero según yo si se ocupa 

  const pedidosEnCamino = pedidosUsuario.filter(j => j.estado === 'enCamino');
  const pedidosEntregados = pedidosUsuario.filter(j => j.estado === 'entregado');

  const pedidosMostrados = filtroActivo === 'enCamino' ? pedidosEnCamino : pedidosEntregados;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-overlay"></div>
      <div className="dashboard-content animate-fade-in">
        <div className="dashboard-buffer" style={{ height: '80px' }}></div>

        <main className="dashboard-main">
          <h1 className="dashboard-title">{user.full_name}</h1>
          <hr className="dashboard-divider" />

          <div className="mispedidos-filters">
            <button className={filtroActivo === 'enCamino' ? 'active' : ''} onClick={() => setFiltroActivo('enCamino')}>EN CAMINO</button>
            <button className={filtroActivo === 'entregados' ? 'active' : ''} onClick={() => setFiltroActivo('entregados')}>ENTREGADOS</button>
          </div>

          <div className="dashboard-body">
            <DashboardAside />

            <section className="dashboard-section" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {pedidosMostrados.map(jersey => {
                const subtotal = jersey.highest_bid;
                const iva = (subtotal * 0.16).toFixed(2);
                const total = (subtotal + parseFloat(iva)).toFixed(2);

                return (
                  <div key={jersey.id} className="pedido-contenedor animate-pop-in">
                    <div className="pedido-card-horizontal">
                      <JerseyCard jersey={jersey} />
                      <div className="resumen-envio">
                        <h4 className="resumen-title">RESUMEN DEL ENVÍO</h4>
                        <div className="resumen-line"><span>SUBTOTAL: </span><span>{subtotal.toFixed(2)} US</span></div>
                        <div className="resumen-line"><span>IVA: </span><span>{iva} US</span></div>
                        <div className="resumen-line total"><span>TOTAL: </span><span>{total} US</span></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MisPedidos;
*/


/*
//Extrae información de Jerseys.js

import React, { useState } from 'react';
import { jerseys } from './jerseys';
import './MisPedidos.css';
import { useSelector } from 'react-redux';
import DashboardAside from './DashboardAside';
import JerseyCard from './JerseyCard';

const MisPedidos = () => {
  const user = useSelector((state) => state.auth.user);

  const [filtroActivo, setFiltroActivo] = useState('enCamino');

  const pedidosEnCamino = jerseys.slice(0, 3);// Es para probar jerseys en camino
  const pedidosEntregados = jerseys.slice(3, 6); //Es para probar jerseys entregados

  const pedidosMostrados = filtroActivo === 'enCamino' ? pedidosEnCamino : pedidosEntregados;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-overlay"></div>
      <div className="dashboard-content animate-fade-in">
        <div className="dashboard-buffer" style={{ height: '80px' }}></div>

        <main className="dashboard-main">
          <h1 className="dashboard-title">{user.full_name}</h1>
          <hr className="dashboard-divider" />

          <div className="mispedidos-filters">
            <button className={filtroActivo === 'enCamino' ? 'active' : ''} onClick={() => setFiltroActivo('enCamino')}>EN CAMINO</button>
            <button className={filtroActivo === 'entregados' ? 'active' : ''} onClick={() => setFiltroActivo('entregados')}>ENTREGADOS</button>
          </div>

          <div className="dashboard-body">
            <DashboardAside />

            <section className="dashboard-section" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {pedidosMostrados.map(jersey => {
                const subtotal = jersey.highest_bid;
                const iva = (subtotal * 0.16).toFixed(2);
                const total = (subtotal + parseFloat(iva)).toFixed(2);

                return (
                  <div key={jersey.id} className="pedido-contenedor animate-pop-in">
                    <div className="pedido-card-horizontal">
                      <JerseyCard jersey={jersey} />
                      <div className="resumen-envio">
                        <h4 className="resumen-title">RESUMEN DEL ENVÍO</h4>
                        <div className="resumen-line"><span>SUBTOTAL: </span><span>{subtotal.toFixed(2)} US</span></div>
                        <div className="resumen-line"><span>IVA: </span><span>{iva} US</span></div>
                        <div className="resumen-line total"><span>TOTAL: </span><span>{total} US</span></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MisPedidos;
*/
