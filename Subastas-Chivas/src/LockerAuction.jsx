import React, { useState, useEffect, useRef } from 'react';
import './locker-auction.css';
import { useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import JerseyAttributes from './JerseyAttributes';
import BidInput from './BidInput';
import BidHistory from './BidHistory';
import JerseyInfo from './JerseyInfo';

export default function LockerAuction() {
  const { auctionID } = useParams();
  const [jersey, setJersey] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState('');
  const [selectedImage, setSelectedImage] = useState('front'); // 'front' or 'back'
  const lockerImageRef = useRef(null);
  const [highestBidder, setHighestBidder] = useState('')

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
          .from('auctions')
          .select(`
            auction_id,
            auction_status,
            start_time,
            end_time,
            highest_bid,
            jerseys (
              jersey_id,
              match_id,
              player_name,
              jersey_number,
              size,
              image_url,
              back_image_url,
              used,
              signed,
              description,
              matches (
                opponent,
                venue,
                competition,
                match_date
              )
            )
          `)
          .eq('auction_id', auctionID); // Filter by auction ID
  
        if (error) {
          console.error('Error fetching auction data:', error.message);
          return;
        }
  
        if (!auctionData || auctionData.length === 0) {
          console.warn('No auctions found for this jersey.');
          setJersey(null);
          return;
        }

        const { data: bids, error: bids_error } = await supabase
          .from('bids')
          .select('bidder_id, amount, created_at')
          .eq('auction_id', auctionID)
          .order('created_at', { ascending: false }) // Sort descending
          .limit(1); // Get only the top one

          if (bids_error) {
            console.error('Error fetching auction data:', error.message);
            return;
          }
    
          if (!bids || bids.length === 0) {
            console.warn('No bids found for this jersey.');
          } else{
            console.log(bids)
            setHighestBidder(bids[0].bidder_id)
          }

        // Merge auction-level data with nested jersey data
        const selectedAuction = auctionData[0];
        const mergedData = {
          ...selectedAuction.jerseys,
          auction_id: selectedAuction.auction_id,
          auction_status: selectedAuction.auction_status,
          start_time: selectedAuction.start_time,
          end_time: selectedAuction.end_time,
          highest_bid: selectedAuction.highest_bid,
          opponent: selectedAuction.jerseys.matches.opponent,
          date: selectedAuction.jerseys.matches.match_date,

          venue: selectedAuction.jerseys.matches.venue,
          competition: selectedAuction.jerseys.matches.competition,
          description: selectedAuction.jerseys.description,

        };
  
        setJersey(mergedData); // Set the merged data
        console.debug('Merged Auction Data:', mergedData);
      } catch (err) {
        console.error('Unexpected error fetching auction data:', err);
      }
    };
  
    fetchAuctionData();
  }, [auctionID]);
  
  // Remaining code for rendering the auction...
  useEffect(() => {
    const fetchStartingBid = async () => {
      try {
        const { data, error } = await supabase
          .from('auctions')
          .select('highest_bid')
          .eq('auction_id', auctionID)
          .single(); // Fetch the latest highest_bid
  
        if (error) {
          console.error('Error refreshing starting bid:', error.message);
          return;
        }
  
        if (data) {
          setJersey((prevJersey) => ({
            ...prevJersey,
            highest_bid: data.highest_bid, // Update the highest_bid
          }));        }
      } catch (err) {
        console.error('Unexpected error refreshing starting bid:', err);
      }
    };
  
    const interval = setInterval(fetchStartingBid, 1000); // Refresh every second
  
    return () => clearInterval(interval); // Clear interval on unmount
  }, [auctionID]);

  useEffect(() => {
    const updateStatusAndTimeLeft = () => {
      if (!jersey || !jersey.start_time || !jersey.end_time) {
        console.debug('Jersey is null or missing auction data:', jersey);
        return;
      }
  
      const now = new Date();
      const start = new Date(jersey.start_time);
      const end = new Date(jersey.end_time);
  
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
        highest_bid: newBid,
      },
    }));
  };

  const handleImageSelection = (imageType) => {
    setSelectedImage(imageType);
  };

  if (!jersey) {
    return <div>Loading...</div>;
  }

  // Determine which image to display based on selection
  const displayImage = selectedImage === 'front' ? jersey.image_url : jersey.back_image_url;

  return (
    <div className="locker-auction">
      <div className="locker-auction-overlay"/>
      <img
        ref={lockerImageRef}
        src="../public/locker-complete.png"
        className="locker-complete"
        alt="Locker Complete"
        onLoad={updateJerseyPosition}
      />
  
      <div className="locker-auction-jersey">
        <img src="../public/locker.png" className="locker-auction-jersey-locker-img" alt="Locker" />
        <img src="../public/hanger.png" className="locker-auction-hanger" alt="Jersey Hanger" />
        <img src={displayImage} className="locker-auction-jersey-img" alt="Jersey" />
        <div className='mini-jerseys'>
          <img 
            src={jersey.image_url} 
            className={`locker-auction-jersey-img-mini ${selectedImage === 'front' ? 'selected' : ''}`}
            alt="Jersey Front" 
            onClick={() => handleImageSelection('front')}
          />
          {jersey.back_image_url &&<img 
            src={jersey.back_image_url} 
            className={`locker-auction-jersey-img-mini ${selectedImage === 'back' ? 'selected' : ''}`}
            alt="Jersey Back" 
            onClick={() => handleImageSelection('back')}
          /> }
        </div>
        <img src="../public/locker-cabinet.png" className="locker-cabinet" alt="Locker Cabinet" />

        <JerseyInfo
          venue={jersey.venue} 
          competition={jersey.competition}
          description={jersey.description}
        />
        <div className="locker-auction-auction">
          <img src="../public/locker.png" className="locker-auction-locker-img"/>
          <div className="auction-info">
            <p className="auction-id">ID: {jersey.auction_id}</p>
            {jersey.player_name && (
              <div className="auction-label">{jersey.player_name}</div>
            )}
            {jersey.opponent && jersey.date && 
              <h1 className='auction-opponent'>
                VS {jersey.opponent} {jersey.date}
              </h1>
            }
            {jersey.match_id && (
              <div className="auction-status">
                {timeLeft === 'Terminada' ? 'PUJA FINAL' : 'PUJA ACTUAL'}
              </div>
            )}
            {jersey.highest_bid && (
              <div className="auction-bid-container">
                <div className="auction-bid">${jersey.highest_bid} USD</div>
              </div>
            )}
            <div className="auction-attributes">
              <JerseyAttributes jersey={jersey} />
            </div>
            {jersey.end_time && (
              <div className="auction-time-remaining">{timeLeft}</div>
            )}
            {timeLeft!=='Terminada'&& (
              <BidInput jersey={jersey} onBidUpdate={handleBidUpdate} highestBidder={highestBidder}/>
            )}
            {timeLeft==='Terminada'&&<hr className='line'/>}
            <p className='auction-static-info'>Este producto fue recolectado directamente de la cancha. 
Incluye un certificado digital personal que asegura y proteje
la identidad del producto. Sólo debes de acercar el teléfono
al chip NFC.</p>
              <BidHistory auctionID={auctionID} />
          </div>
            
        </div>
      </div>
    </div>
  );
}