// src/components/BitsoPanel.js
import React, { useState, useEffect } from 'react';

export default function BitsoPanel() {
  const [balances, setBalances] = useState(null);
  const [error, setError]       = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch('/api/bitso-balance');
        const data = await res.json();
        if (res.ok) {
          setBalances(data);
        } else {
          throw new Error(data.error || 'Error al obtener saldo');
        }
      } catch (e) {
        setError(e.message || 'Error de conexión');
      }
    };

    fetchBalance();
  }, []);

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