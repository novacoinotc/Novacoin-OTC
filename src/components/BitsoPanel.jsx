import React, { useEffect, useState } from 'react';
import ExchangeRate from './ExchangeRate';
import MarketBoard from './MarketBoard';

const BitsoPanel = () => {
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(false);
  const [buying, setBuying] = useState(false);
  const [message, setMessage] = useState('');

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/bitso-balance');
      const data = await res.json();

      if (data && data.balances) {
        const filtered = data.balances.filter(b => parseFloat(b.available) > 0);
        setBalance(filtered);
        setError(false);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Error al obtener el balance:', err);
      setError(true);
    }
  };

  const handleBuy = async () => {
    setBuying(true);
    setMessage('');
    try {
      const res = await fetch('/api/bitso-buy-usdt', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ Compra realizada con éxito');
        fetchBalance(); // actualizar saldo
      } else {
        setMessage(`❌ Error: ${data.error || 'No se pudo realizar la compra'}`);
      }
    } catch (err) {
      setMessage('❌ Error de conexión al intentar comprar');
    } finally {
      setBuying(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Mercado Bitso</h2>
      <ExchangeRate />
      <MarketBoard />

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4">💼 Saldo en Bitso</h3>
        {error ? (
          <p className="text-red-600">❌ No se pudo obtener el saldo</p>
        ) : !balance ? (
          <p className="text-gray-600">Cargando saldo...</p>
        ) : balance.length === 0 ? (
          <p className="text-gray-500">Sin fondos disponibles</p>
        ) : (
          <ul className="space-y-2 mb-4">
            {balance.map((b, idx) => (
              <li key={idx} className="flex justify-between border-b pb-1 text-sm">
                <span className="font-medium uppercase">{b.currency}</span>
                <span className="text-gray-700">{parseFloat(b.available).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={handleBuy}
          disabled={buying}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {buying ? 'Comprando USDT...' : 'Comprar USDT con MXN'}
        </button>

        {message && (
          <p className="text-center mt-3 text-sm font-medium text-blue-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default BitsoPanel;
