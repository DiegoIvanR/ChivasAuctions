import React, { useState } from "react";

function Footer() {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const sections = [
    {
      title: "SUBASTAS CHIVAS",
      items: ["C. Cto. JVC 2800", "El Bajío, Zapopan, Jal.", "C.P. 45019"],
    },
    {
      title: "LEGAL",
      items: [
        "Aviso de Privacidad",
        "Términos de Servicio",
        "Preferencias de Cookies",
        "Información Corporativa",
      ],
    },
    {
      title: "NAVEGAR",
      items: ["Envíos y Devoluciones", "Contáctanos", "Mapa del sitio"],
    },
    {
      title: "SÍGUENOS",
      isSocial: true,
      image: "../public/Social.png",
    },
  ];

  return (
    <footer className="footer">
      <div className="footer-bullshit">
        <div className="drop-down-language">
          <img src="../public/globe.png" className="globe" alt="globe" />
          <h3 className="language">Español</h3>
          <img src="../public/drop-down.png" className="drop-down" alt="dropdown" />
        </div>

        {sections.map((section, index) => (
          <div
            key={index}
            className={`footer-content ${openIndex === index ? "open" : ""}`}
          >
            <h1
              className="footer-title"
              onClick={() => handleToggle(index)}
            >
              {section.title}
            </h1>
            {!section.isSocial &&
              section.items.map((text, i) => (
                <p key={i} className="footer-text">{text}</p>
              ))}
            {section.isSocial && openIndex === index && (
                <img src={section.image} className="social-logos footer-text" alt="social" />
                )}
          </div>
        ))}
      </div>
      <h2 className="footer-text last-text">© 2025 Chivas F.C.</h2>
    </footer>
  );
}

export default Footer;
