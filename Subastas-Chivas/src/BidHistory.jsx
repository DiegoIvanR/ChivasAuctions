import React, { useState, useEffect } from 'react';
import './bid-history.css';
import { supabase } from './supabaseClient';

export default function BidHistory({ auctionID }) {
    const [bids, setBids] = useState([]);

    useEffect(() => {
        const fetchBids = async () => {
            try {
                const { data, error } = await supabase
                    .from('bids')
                    .select('bidder_id, amount, created_at')
                    .eq('auction_id', auctionID)
                    .order('created_at', { ascending: false }); // Sort by created_at descending

                if (error) {
                    console.error('Error fetching bids:', error.message);
                } else {
                    setBids(data);
                }
            } catch (err) {
                console.error('Unexpected error fetching bids:', err);
            }
        };

        fetchBids(); // Fetch bids initially

        const interval = setInterval(fetchBids, 1000); // Reload bids every second

        return () => clearInterval(interval); // Clear interval on unmount
    }, [auctionID]);

    return (
        <div className="bid-history-container">
            <h3 className="title">HISTORIAL DE PUJAS</h3>
            <div className="bid-list">
                {bids.length === 0 ? (
                    <p>No hay pujas disponibles.</p>
                ) : (
                    bids.map((bid, idx) => (
                        <div key={idx} className="bid-row">
                            <div className="bidder">Postor {bid.bidder_id}</div>
                            <div className="timestamp">
                                {new Date(bid.created_at).toLocaleDateString('es-MX', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                })},{' '}
                                {new Date(bid.created_at).toLocaleTimeString('es-MX')}
                            </div>
                            <div className="amount">{bid.amount} MXN</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}