import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function SearchBar() {
  const [query, setQuery] = useState(""); // State to store the input value
  const navigate = useNavigate(); // Initialize navigate

  const handleInputChange = (event) => {
    setQuery(event.target.value); // Update the query state as the user types
  };

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/locker-room-search?query=${encodeURIComponent(query)}`); // Navigate to LockerRoomSearch with query
    }
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
        placeholder="Buscar"
        className="search-input"
        value={query}
        onChange={handleInputChange}
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