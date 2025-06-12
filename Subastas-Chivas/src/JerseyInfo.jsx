import React from "react";
import './JerseyInfo.css'
export default function JerseyInfo({venue, competition, description}){
    return(
        <div className="add-jersey-info">
            {description &&
                <div className="jersey-fact">
                    <strong className="jersey-fact-title">DESCRIPCIÓN: </strong>
                    <p className="jersey-fact-text">{description}</p>
                </div>
            }

            {competition &&
                <div className="jersey-fact">
                    <strong className="jersey-fact-title">LIGA: </strong>
                    <p className="jersey-fact-text">{competition}</p>
                </div>
            }
            
            {venue &&
                <div className="jersey-fact">
                    <strong className="jersey-fact-title">ESTADIO: </strong>
                    <p className="jersey-fact-text">{venue}</p>
                </div>
            }
            

        </div>
    )
}