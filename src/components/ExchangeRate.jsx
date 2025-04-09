import React, { useEffect, useState } from 'react';

const ExchangeRate = () => {
  const [rate, setRate] = useState(null);
  const [prevRate, setPrevRate] = useState(null);
  const [error, setError] = useState(false);

  const fetchRate = async () => {
    try {
      const response = await fetch('https://api.bitso.com/v3/ticker/?book=usdt_mxn');
      const data = await response.json();
      const currentRate = parseFloat(data.payload.last);
      setPrevRate(rate);
      setRate(currentRate);
      setError(false);
    } catch (err) {
      console.error('Error al obtener tipo de cambio:', err);
      setError(true);
    }
  };

  useEffect(() => {
    fetchRate(); // primer carga
    const interval = setInterval(fetchRate, 2000); // actualiza cada 2s
    return () => clearInterval(interval);
  }, [rate]);

  const getColor = () => {
    if (!prevRate || !rate) return 'text-gray-800';
    return rate > prevRate ? 'text-green-600' : rate < prevRate ? 'text-red-600' : 'text-gray-800';
  };

  const getIcon = () => {
    if (!prevRate || !rate) return '';
    return rate > prevRate ? '⬆' : rate < prevRate ? '⬇' : '→';
  };

  if (error) {
    return <div className="text-center text-red-600 font-semibold">❌ Error con la API de Bitso</div>;
  }

  if (!rate) {
    return <div className="text-center text-gray-500 font-medium">Cargando tipo de cambio...</div>;
  }

  return (
    <div className="text-center font-bold text-lg mt-2 mb-4">
      <span className={getColor()}>USDT/MXN: ${rate.toFixed(4)} {getIcon()}</span>
    </div>
  );
};

export default ExchangeRate;
