// src/components/BitsoPanel.js
import React, { useState, useEffect } from 'react';

export default function BitsoPanel() {
  const [balances, setBalances] = useState([]);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(true);

  // Asegúrate de tener en tu .env:
  // REACT_APP_BITSO_API_KEY=tzbquXnVVT
  // REACT_APP_BITSO_API_SECRET=f4a9232db5fe441b467019690c456327
  const API_KEY    = process.env.REACT_APP_BITSO_API_KEY;
  const API_SECRET = process.env.REACT_APP_BITSO_API_SECRET;

  useEffect(() => {
    async function fetchBalances() {
      setLoading(true);
      setError('');
      try {
        const nonce       = Date.now().toString();
        const method      = 'GET';
        const requestPath = '/v3/balance/';
        // CryptoJS viene de tu <script> en index.js
        const signature = CryptoJS.HmacSHA256(
          nonce + method + requestPath,
          API_SECRET
        ).toString(CryptoJS.enc.Hex);

        const res = await fetch(`https://api.bitso.com${requestPath}`, {
          method,
          headers: {
            Authorization: `Bitso ${API_KEY}:${signature}`,
            'Bitso-Nonce': nonce,
            'Content-Type': 'application/json'
          }
        });

        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error?.message || 'Error desconocido');
        }
        setBalances(json.payload.balances);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error al cargar balances');
      } finally {
        setLoading(false);
      }
    }

    fetchBalances();
  }, [API_KEY, API_SECRET]);

  if (loading) return <p className="text-sm text-gray-500">Cargando balances...</p>;
  if (error)   return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white shadow-lg rounded-xl p-4">
      <h2 className="text-xl font-bold mb-4">Bitso · Saldo de Cuenta</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Moneda</th>
            <th className="p-2 text-right">Disponible</th>
            <th className="p-2 text-right">Reservado</th>
          </tr>
        </thead>
        <tbody>
          {balances.map(b => (
            <tr key={b.currency} className="border-b">
              <td className="p-2">{b.currency}</td>
              <td className="p-2 text-right">{parseFloat(b.available).toLocaleString()}</td>
              <td className="p-2 text-right">{parseFloat(b.reserved).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}