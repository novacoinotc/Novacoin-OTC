// src/components/BitsoPanel.js
import React, { useState, useEffect } from 'react';

export default function BitsoPanel() {
  const [balances, setBalances] = useState(null);
  const [error, setError]       = useState('');

  // Leemos la API key y el secret del .env.local
  const API_KEY    = process.env.REACT_APP_BITSO_API_KEY;
  const API_SECRET = process.env.REACT_APP_BITSO_API_SECRET;

  useEffect(() => {
    // Si no tenemos claves, mostramos error
    if (!API_KEY || !API_SECRET) {
      setError('Faltan credenciales de Bitso en .env.local');
      return;
    }

    const fetchBalance = async () => {
      try {
        const nonce  = Math.floor(Date.now() / 1000).toString();
        const method = 'GET';
        const path   = '/v3/balance/';

        // CryptoJS ya está disponible en window
        if (!window.CryptoJS) {
          throw new Error('CryptoJS no cargado');
        }

        // Firmamos: nonce + método + ruta + body (vacío para GET)
        const signature = window.CryptoJS
          .HmacSHA256(nonce + method + path, API_SECRET)
          .toString();

        const res = await fetch(`https://api.bitso.com${path}`, {
          method,
          headers: {
            'Authorization': `Bitso ${API_KEY}:${signature}`,
            'Bitso-Nonce':   nonce,
            'Content-Type':  'application/json'
          }
        });

        const data = await res.json();

        if (!data.success) {
          // Bitso devuelve { success: false, error: { message: '...' } }
          throw new Error(data.error?.message || 'Error desconocido de Bitso');
        }

        setBalances(data.payload);
      } catch (e) {
        setError(e.message || 'Error de red');
      }
    };

    fetchBalance();
  }, [API_KEY, API_SECRET]);

  return (
    <div className="bg-white shadow-lg rounded-xl p-4">
      <h2 className="text-xl font-bold mb-4">Bitso · Tu Saldo</h2>

      {error && (
        <p className="text-red-500">{error}</p>
      )}

      {!balances && !error && (
        <p>Cargando saldo privado…</p>
      )}

      {balances && (
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Moneda</th>
              <th className="text-right">Disponible</th>
            </tr>
          </thead>
          <tbody>
            {balances.map((line) => (
              <tr key={line.currency}>
                <td>{line.currency}</td>
                <td className="text-right">
                  {parseFloat(line.available).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}