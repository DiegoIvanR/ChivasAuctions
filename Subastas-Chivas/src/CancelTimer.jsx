import React, { useEffect, useState } from 'react';
import './cancel-timer.css';

export default function CancelTimer({ previousBid, onCancel, onTimerEnd }) {
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onTimerEnd(); // Notify parent when timer ends
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Cleanup the timer when the component unmounts
        return () => clearInterval(timer);
    }, [onTimerEnd]);

    return (
        <div className="cancel-container">
            <button onClick={onCancel} className="cancel-button">
                Cancelar Puja
            </button>
            <p className="cancel-timer">Tiempo restante: {timeLeft}s</p>
        </div>
    );
}