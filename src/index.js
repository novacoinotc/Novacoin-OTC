// src/index.js
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

// 1) Carga dinámica de CryptoJS desde CDN
function loadCryptoJS() {
  return new Promise((resolve, reject) => {
    if (window.CryptoJS) return resolve();
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js";
    script.onload = () => {
      console.log("CryptoJS cargado");
      resolve();
    };
    script.onerror = () => {
      console.error("No se pudo cargar CryptoJS desde CDN");
      reject(new Error("CryptoJS load failed"));
    };
    document.head.appendChild(script);
  });
}

// 2) Esperamos a que CryptoJS esté listo antes de montar React
loadCryptoJS()
  .then(() => {
    const root = createRoot(document.getElementById("root"));
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  })
  .catch((err) => {
    console.error("Error cargando CryptoJS:", err);
    // Aun así montamos la app si falló la carga de CryptoJS
    const root = createRoot(document.getElementById("root"));
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });