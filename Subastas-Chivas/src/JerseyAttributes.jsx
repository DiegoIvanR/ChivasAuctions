import React from "react";

export default function JerseyAttributes({ jersey }) {
  return (
    <div className="jersey-attributes">
      {jersey.used && (
        <div className="jersey-att-container">
          <p className="jersey-att">USADA</p>
        </div>
      )}
      {jersey.signed && (
        <div className="jersey-att-container">
          <p className="jersey-att">FIRMADA</p>
        </div>
      )}
    </div>
  );
}