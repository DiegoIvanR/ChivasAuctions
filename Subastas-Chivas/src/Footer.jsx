import React from "react";

function Footer(){
    return(
        <footer className="footer">
            

            <div className="footer-bullshit">
                <div className="drop-down-language">
                    <img src="../public/globe.png" className="globe"></img>
                    <h3 className="language">
                        Español
                    </h3>
                    <img src="../public/drop-down.png" className="drop-down"></img>
                </div>
                <div className="footer-content">
                    <h1 className="footer-title">
                        SUBASTAS CHIVAS
                    </h1>
                    <p className="footer-text">
                        C. Cto. JVC 2800
                    </p>
                    <p className="footer-text">
                        El Bajío, Zapopan, Jal.
                    </p>
                    <p className="footer-text">
                        C.P. 45019
                    </p>
                </div>

                <div className="footer-content">
                    <h1 className="footer-title">
                        LEGAL
                    </h1>
                    <p className="footer-text">
                        Aviso de Privacidad
                    </p>
                    <p className="footer-text">
                        Términos de Servicio
                    </p>
                    <p className="footer-text">
                        Preferencias de Cookies
                    </p>
                    <p className="footer-text">
                        Información Corporativa
                    </p>
                </div>

                <div className="footer-content">
                    <h1 className="footer-title">
                        NAVEGAR
                    </h1>
                    <p className="footer-text">
                        Envíos y Devoluciones
                    </p>
                    <p className="footer-text">
                        Contáctanos
                    </p>
                    <p className="footer-text">
                        Mapa del sitio
                    </p>
                </div>
                <div className="footer-content">
                    <h1 className="footer-title">
                        SÍGUENOS
                    </h1>
                    <img src="../public/Social.png" className="social-logos"></img>
                </div>
            </div>
            <h2 className="footer-text last-text">© 2025 Chivas F.C.</h2>
        </footer>
    );

}
export default Footer;