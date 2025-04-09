import React, { useEffect, useState } from 'react';

const ExchangeRate = () => {
  const [price, setPrice] = useState(null);
  const [previousPrice, setPreviousPrice] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch('https://api.bitso.com/v3/ticker/?book=usdt_mxn');
        const data = await res.json();
        const currentPrice = parseFloat(data?.payload?.last);

        if (!isNaN(currentPrice)) {
          setPreviousPrice(price);
          setPrice(currentPrice);
          setError(null);
        } else {
          throw new Error("Precio no válido");
        }
      } catch (err) {
        setError("Error al obtener el precio de Bitso");
      }
    };

    fetchRate();
    const interval = setInterval(fetchRate, 2000);
    return () => clearInterval(interval);
  }, [price]);

  const color = !previousPrice
    ? 'text-black'
    : price > previousPrice
    ? 'text-green-600'
    : price < previousPrice
    ? 'text-red-600'
    : 'text-gray-600';

  const arrow = !previousPrice
    ? ''
    : price > previousPrice
    ? '↑'
    : price < previousPrice
    ? '↓'
    : '→';

  return (
    <div className="text-center my-4">
      <h3 className="text-xl font-semibold">Tipo de Cambio USDT/MXN</h3>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : price ? (
        <p className={`text-3xl font-bold ${color}`}>
          ${price.toFixed(2)} <span className="text-2xl">{arrow}</span>
        </p>
      ) : (
        <p className="text-gray-500">Cargando...</p>
      )}
    </div>
  );
};

export default ExchangeRate;
