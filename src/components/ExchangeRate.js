import React, { useEffect, useState } from 'react';

const ExchangeRate = () => {
  const [rate, setRate] = useState(null);
  const [previousRate, setPreviousRate] = useState(null);
  const [error, setError] = useState(null);

  const token = 'f06f6fa8a79c86280b53e1dfc9fc730d69aff07895554a8d75134a4ec79f45d5';

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch(
          'https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/oportuno',
          {
            headers: {
              'Bmx-Token': token,
              'Accept': 'application/json'
            }
          }
        );

        const data = await res.json();
        const nuevoValor = parseFloat(data?.bmx?.series?.[0]?.datos?.[0]?.dato.replace(',', ''));

        if (!isNaN(nuevoValor)) {
          setPreviousRate(rate);
          setRate(nuevoValor);
        } else {
          setError('No se pudo obtener el tipo de cambio');
        }
      } catch (err) {
        setError('Error al conectar con Banxico');
      }
    };

    fetchRate();
    const interval = setInterval(fetchRate, 2000);

    return () => clearInterval(interval);
  }, [rate]);

  const getColor = () => {
    if (previousRate === null || rate === null) return 'text-gray-700';
    return rate > previousRate ? 'text-green-600' : rate < previousRate ? 'text-red-600' : 'text-gray-700';
  };

  const getArrow = () => {
    if (previousRate === null || rate === null) return '';
    return rate > previousRate ? '▲' : rate < previousRate ? '▼' : '⭮';
  };

  return (
    <div className="text-center py-2 mb-4">
      {error ? (
        <span className="text-red-600">{error}</span>
      ) : rate ? (
        <div className={`inline-block px-6 py-2 rounded-full bg-white shadow text-xl font-semibold ${getColor()} transition-all duration-300`}>
          {getArrow()} Tipo de cambio USD/MXN: <span className="font-bold">{rate.toFixed(4)}</span>
        </div>
      ) : (
        <span className="text-gray-500">Cargando tipo de cambio...</span>
      )}
    </div>
  );
};

export default ExchangeRate;
