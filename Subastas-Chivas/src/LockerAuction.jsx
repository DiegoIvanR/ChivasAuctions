import React, { useState, useEffect, useRef } from 'react';
import './locker-auction.css';
import { useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import JerseyAttributes from './JerseyAttributes';
import BidInput from './BidInput';

export default function LockerAuction() {
  const { auctionID } = useParams();
  const [jersey, setJersey] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState('');
  const lockerImageRef = useRef(null);

  const updateJerseyPosition = () => {
    const lockerImage = lockerImageRef.current;
    const jerseyElement = document.querySelector('.locker-auction-jersey');

    if (lockerImage && jerseyElement) {
      const height = lockerImage.offsetHeight;
      const offset = height * 0.1;
      jerseyElement.style.top = `${offset}px`;
      console.debug('Locker Image Height:', height);
      console.debug('Jersey Element Offset:', offset);
    } else {
      console.warn('Locker image or jersey element not found.');
    }
  };

  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        const { data: auctionData, error } = await supabase
          .from('jerseys')
          .select(`
            jersey_id,
            match_id,
            player_name,
            jersey_number,
            size,
            image_url,
            auctions (
              auction_id,
              auction_status,
              start_time,
              end_time,
              starting_bid
            ),
            matches (
              opponent,
              venue,
              competition
            )
          `)
          .eq('auctions.auction_id', auctionID)
          .single();

        if (error) {
          console.error('Error fetching auction data:', error.message);
          return;
        }

        // Ensure auctions is an array and pick the first auction
        if (auctionData.auctions && auctionData.auctions.length > 0) {
          auctionData.auctions = auctionData.auctions[0];
        } else {
          console.warn('No auctions found for this jersey.');
          auctionData.auctions = null;
        }

        setJersey(auctionData);
        console.debug('Fetched Auction Data:', auctionData);
      } catch (err) {
        console.error('Unexpected error fetching auction data:', err);
      }
    };

    fetchAuctionData();
  }, [auctionID]);

  useEffect(() => {
    const updateStatusAndTimeLeft = () => {
      if (!jersey || !jersey.auctions?.start_time || !jersey.auctions?.end_time) {
        console.debug('Jersey is null or missing auction data:', jersey);
        return;
      }

      const now = new Date();
      const start = new Date(jersey.auctions.start_time);
      const end = new Date(jersey.auctions.end_time);

      const diffMs = end - now;
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      console.debug('Days:', days, 'Hours:', hours, 'Minutes:', minutes, 'Seconds:', seconds);

      if (now < start) {
        setStatus('PUJA FUTURA');
        setTimeLeft(
          days > 0
            ? `faltan ${days} días`
            : hours > 0
            ? `faltan ${hours} horas`
            : minutes > 0
            ? `faltan ${minutes} minutos`
            : `faltan ${seconds} segundos`
        );
      } else if (now >= start && now <= end) {
        setStatus('PUJA ACTUAL');
        setTimeLeft(
          days > 0
            ? `quedan ${days} días`
            : hours > 0
            ? `quedan ${hours} horas`
            : minutes > 0
            ? `quedan ${minutes} minutos`
            : `quedan ${seconds} segundos`
        );
      } else {
        setStatus('PUJA FINAL');
        setTimeLeft('Terminada');
      }
    };

    updateStatusAndTimeLeft();
    const interval = setInterval(updateStatusAndTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [jersey]);

  useEffect(() => {
    const lockerImage = lockerImageRef.current;

    if (lockerImage) {
      lockerImage.addEventListener('load', updateJerseyPosition);

      if (lockerImage.complete) {
        updateJerseyPosition();
      }
    }

    window.addEventListener('resize', updateJerseyPosition);

    return () => {
      if (lockerImage) {
        lockerImage.removeEventListener('load', updateJerseyPosition);
      }
      window.removeEventListener('resize', updateJerseyPosition);
    };
  }, []);

  const handleBidUpdate = (newBid) => {
    setJersey((prevJersey) => ({
      ...prevJersey,
      auctions: {
        ...prevJersey.auctions,
        starting_bid: newBid,
      },
    }));
  };

  if (!jersey) {
    return <div>Loading...</div>;
  }

  return (
    <div className="locker-auction">
      <img
        ref={lockerImageRef}
        src="../public/locker-complete.png"
        className="locker-complete"
        alt="Locker Complete"
        onLoad={updateJerseyPosition}
      />

      <div className="locker-auction-jersey">
        <img src="../public/locker.png" className="locker-auction-jersey-locker-img" alt="Locker" />
        <img src={jersey.image_url} className="locker-auction-jersey-img" alt="Jersey" />
        <img src="../public/locker-cabinet.png" className="locker-cabinet" alt="Locker Cabinet" />
        <div className="locker-auction-auction">
          <div className="auction-info">
            <p className="auction-id">ID: {jersey.jersey_id}</p>
            {jersey.player_name && (
              <div className="auction-label">{jersey.player_name}</div>
            )}
            {jersey.match_id && (
              <div className="auction-status">
                {timeLeft === 'Terminada' ? 'PUJA FINAL' : 'PUJA ACTUAL'}
              </div>
            )}
            {jersey.auctions?.starting_bid && (
              <div className="auction-bid-container">
                <div className="auction-bid">${jersey.auctions.starting_bid}</div>
              </div>
            )}
            <div className="auction-attributes">
              <JerseyAttributes jersey={jersey} />
            </div>
            {jersey.auctions?.end_time && (
              <div className="auction-time-remaining">{timeLeft}</div>
            )}
            <BidInput jersey={jersey} onBidUpdate={handleBidUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
}