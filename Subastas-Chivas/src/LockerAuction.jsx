import React, { useState, useEffect, useRef } from 'react';
import './locker-auction.css';
import { jerseys } from './jerseys';
import { useParams } from 'react-router-dom';
import JerseyAttributes from './JerseyAttributes';
import BidInput from './BidInput';

export default function LockerAuction() {
    let { auctionID } = useParams();
    const jerseyData = jerseys.find(jersey => jersey.id === Number(auctionID));
    const [jersey, setJersey] = useState(jerseyData);
    const [timeLeft, setTimeLeft] = useState('');
    const lockerImageRef = useRef(null);

    function updateJerseyPosition() {
        const lockerImage = lockerImageRef.current;
        const jerseyElement = document.querySelector('.locker-auction-jersey');

        if (lockerImage && jerseyElement) {
            const height = lockerImage.offsetHeight;
            const offset = height * 0.1;
            jerseyElement.style.top = `${offset}px`;
        }
    }

    useEffect(() => {
        const updateTimeLeft = () => {
            if (!jersey.end_date) return;

            const now = new Date();
            const end = new Date(jersey.end_date);
            const diffMs = end - now;
            if (diffMs <= 0) {
                setTimeLeft("Terminada");
                return;
            }

            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
            const seconds = Math.floor((diffMs / 1000) % 60);

            if (days > 0) {
                setTimeLeft(`quedan ${days} días`);
            } else if (hours > 0) {
                setTimeLeft(`quedan ${hours} horas`);
            } else if (minutes > 0) {
                setTimeLeft(`quedan ${minutes} minutos`);
            } else {
                setTimeLeft(`quedan ${seconds} segundos`);
            }
        };
        updateTimeLeft();
        const interval = setInterval(updateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [jersey.end_date]);

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
        setJersey(prevJersey => ({
            ...prevJersey,
            highest_bid: newBid,
        }));
    };

    return (
        <div className='locker-auction'>
            <img
                ref={lockerImageRef}
                src="../public/locker-complete.png"
                className='locker-complete'
                alt="Locker Complete"
            />

            <div className='locker-auction-jersey'>
                <img src="../public/locker.png" className='locker-auction-jersey-locker-img' alt="Locker" />
                <img src={jersey.img_src} className='locker-auction-jersey-img' alt="Jersey" />
                <img src="../public/locker-cabinet.png" className='locker-cabinet' alt="Locker Cabinet" />
                <div className='locker-auction-auction'>
                    <div className='auction-info'>
                        <p className='auction-id'>ID: {jersey.id}</p>
                        {jersey.player && (
                            <div className="auction-label">
                                {jersey.player}
                            </div>
                        )}
                        {jersey.match && (
                            <div className="auction-status">
                                {timeLeft === "Terminada" ? "PUJA FINAL" : "PUJA ACTUAL"}
                            </div>
                        )}
                        {jersey.highest_bid && (
                            <div className="auction-bid-container">
                                <div className='auction-bid'>
                                    ${jersey.highest_bid}
                                </div>
                            </div>
                        )}
                        <div className="auction-attributes">
                            <JerseyAttributes jersey={jersey} />
                        </div>
                        {jersey.end_date && (
                            <div className="auction-time-remaining">
                                {timeLeft}
                            </div>
                        )}
                        <BidInput jersey={jersey} onBidUpdate={handleBidUpdate} />
                    </div>
                    <img src="../public/locker.png" className='locker-auction-locker-img' alt="Locker" />
                </div>
            </div>
        </div>
    );
}