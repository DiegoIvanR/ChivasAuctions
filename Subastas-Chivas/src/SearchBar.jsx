import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function SearchBar() {
  const [query, setQuery] = useState(""); // State to store the search query
  const navigate = useNavigate(); // Initialize navigate

  const handleQueryChange = (event) => {
    setQuery(event.target.value); // Update the query state as the user types
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.append("query", query.trim());
    }
    navigate(`/locker-room-search?${params.toString()}`); // Navigate to LockerRoomSearch with query
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch(); // Trigger search when Enter is pressed
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        id="search-input" // Add id attribute
        name="search" // Add name attribute
        placeholder="Buscar por jugador o equipo"
        className="search-input"
        value={query}
        onChange={handleQueryChange}
        onKeyDown={handleKeyPress} // Listen for Enter key press
      />
      <img
        src="../public/search-logo.png"
        className="search-icon"
        alt="Search"
        onClick={handleSearch} // Trigger search when the search icon is clicked
      />
    </div>
  );
}

export default SearchBar;