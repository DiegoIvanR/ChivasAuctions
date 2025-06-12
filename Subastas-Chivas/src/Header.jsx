import React, { useState } from "react";
import SearchBar from "./SearchBar";
import UserSettingsPopup from "./UserSettingsPopup";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
function Header() {
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    console.log("Redux State:", { user, isAuthenticated }); // Debug Redux state

    const [showPopup, setShowPopup] = useState(false);

    const togglePopup = () => {
        setShowPopup((prev) => !prev);
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <div className="header">
            <div className="menu-selections">
                <a href="https://www.chivasdecorazon.com.mx/es">
                    <img src="../public/logo.png" className="logo" alt="Logo" />
                </a>
                <Link to='/'className="menu-selections-item">Home</Link>
                <a  href="https://chivastv.mx/" className="menu-selections-item">ChivasTV</a>
                <a href="https://tiendachivas.com.mx/" className="menu-selections-item">Tienda Chivas</a>
            </div>
            <div className="menu-right-bar">
                <SearchBar />
                <div className="user-image-container">
                    <img
                        src="../public/profile-icon.png"
                        className="user-image"
                        alt="User"
                        onClick={togglePopup}
                    />
                    {showPopup && <UserSettingsPopup onClose={closePopup} />}
                </div>
            </div>
        </div>
    );
}
export default Header;