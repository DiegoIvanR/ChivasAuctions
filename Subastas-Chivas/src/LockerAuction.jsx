import React, { useState, useEffect, useRef } from 'react';
import './locker-auction.css';
import { jerseys } from './jerseys';
import JerseyAttributes from './JerseyAttributes';

export default function LockerAuction() {
    const lockerImageRef = useRef(null); // Reference for the locker image

    function updateJerseyPosition() {
        const lockerImage = lockerImageRef.current;
        const jersey = document.querySelector('.locker-auction-jersey');

        if (lockerImage && jersey) {
            const height = lockerImage.offsetHeight;
            const offset = height * 0.1; // adjust 0.65 to change vertical position
            jersey.style.top = `${offset}px`;
        }
    }

    const jersey = jerseys[0];
    const [timeLeft, setTimeLeft] = useState('');

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
        updateTimeLeft(); // Run once immediately
        const interval = setInterval(updateTimeLeft, 1000); // Update every second

        return () => clearInterval(interval); // Cleanup when component unmounts
    }, [jersey.end_date]);

    useEffect(() => {
        const lockerImage = lockerImageRef.current;

        if (lockerImage) {
            // Run updateJerseyPosition after the image has loaded
            lockerImage.addEventListener('load', updateJerseyPosition);

            // Call updateJerseyPosition in case the image is already cached
            if (lockerImage.complete) {
                updateJerseyPosition();
            }
        }

        // Add event listener for resize
        window.addEventListener('resize', updateJerseyPosition);

        // Cleanup event listeners on unmount
        return () => {
            if (lockerImage) {
                lockerImage.removeEventListener('load', updateJerseyPosition);
            }
            window.removeEventListener('resize', updateJerseyPosition);
        };
    }, []); // Empty dependency array ensures this runs only once after mount

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
                <img src="../public/javier-hernandez.png" className='locker-auction-jersey-img' alt="Jersey" />
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
                    </div>
                    <img src="../public/locker.png" className='locker-auction-locker-img' alt="Locker" />
                </div>
            </div>
        </div>
    );
}