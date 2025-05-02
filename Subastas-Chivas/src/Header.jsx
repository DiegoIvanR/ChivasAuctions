import React from "react";
import SearchBar from "./SearchBar";
function Header() {
    return(
        <div className="header">
            <div className="menu-selections">
            <img src="../public/logo.png" className="logo" />
                <h1 className="menu-selections-item">
                    En Vivo
                </h1>
                <h1 className="menu-selections-item">
                    Varonil
                </h1>
                <h1 className="menu-selections-item">
                    Femenil
                </h1>
            </div>
            <div className="menu-right-bar">
                <SearchBar/>
                <img src="../public/heart.png" className="heart"/>
                <img src="../public/user-image.png" className="user-image"/>
            </div>
        </div>

    );
}

export default Header;