import React from "react";
import './DashboardHeader.css'

export default function DashboardHeader({name}){
    return (
        <div className="dashboard-header">
            <h1 className="dhh-title--pujas">{name}</h1>
            <hr className="dhh-divider" />
        </div>
    )
}