// src/components/BitsoPanel.js
import React, { useState, useEffect } from 'react';

export default function BitsoPanel() {
  const [ticker, setTicker] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Ejemplo: public endpoint para BTC/MXN
    fetch('https://api.bitso.com/v3/ticker/?book=btc_mxn')
      .then(r => r.json())
      .then(data => {
        if (data.success) setTicker(data.payload);
        else setError('Error al cargar ticker');
      })
      .catch(() => setError('Error de red'));
  }, []);

  return (
    <div className="bg-white shadow-lg rounded-xl p-4">
      <h2 className="text-xl font-bold mb-4">Bitso · BTC/MXN</h2>
      {error && <p className="text-red-500">{error}</p>}
      {!ticker && !error && <p>Cargando...</p>}
      {ticker && (
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td>Ultimo precio</td>
              <td className="text-right">${parseFloat(ticker.last).toLocaleString()}</td>
            </tr>
            <tr>
              <td>Máximo 24h</td>
              <td className="text-right">${parseFloat(ticker.high).toLocaleString()}</td>
            </tr>
            <tr>
              <td>Mínimo 24h</td>
              <td className="text-right">${parseFloat(ticker.low).toLocaleString()}</td>
            </tr>
            <tr>
              <td>Volumen 24h</td>
              <td className="text-right">{parseFloat(ticker.volume).toLocaleString()} BTC</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}