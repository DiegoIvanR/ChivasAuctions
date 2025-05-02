import React from "react";

function SearchBar() {
    return(
        <div className="search-bar">
            <input type="text" placeholder="Buscar" className="search-input"/>
            <img src="../public/search-logo.png" className="search-icon"/>
        </div>
    );
}
export default SearchBar;