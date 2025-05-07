// src/components/BitsoPanel.js
import React, { useState, useEffect } from 'react';

export default function BitsoPanel() {
  const [balances, setBalances] = useState(null);
  const [error, setError]       = useState('');

  useEffect(() => {
    fetch('/api/bitso-balance')
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setBalances(data);
      })
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="bg-white shadow-lg rounded-xl p-4">
      <h2 className="text-xl font-bold mb-4">Bitso · Tu Saldo</h2>

      {error && <p className="text-red-500">{error}</p>}

      {!balances && !error && <p>Cargando saldo privado…</p>}

      {balances && (
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Moneda</th>
              <th className="text-right">Disponible</th>
            </tr>
          </thead>
          <tbody>
            {balances.map(({ currency, available }) => (
              <tr key={currency}>
                <td>{currency}</td>
                <td className="text-right">{parseFloat(available).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}