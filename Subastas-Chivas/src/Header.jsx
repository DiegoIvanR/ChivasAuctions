import React, { useState } from "react";
import SearchBar from "./SearchBar";
import UserSettingsPopup from "./UserSettingsPopup";

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
                <img src="../public/logo.png" className="logo" alt="Logo" />
                <h1 className="menu-selections-item">En Vivo</h1>
                <h1 className="menu-selections-item">Varonil</h1>
                <h1 className="menu-selections-item">Femenil</h1>
            </div>
            <div className="menu-right-bar">
                <SearchBar />
                <img src="../public/heart.png" className="heart" alt="Heart Icon" />
                <div className="user-image-container">
                    <img
                        src="../public/user-image.png"
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