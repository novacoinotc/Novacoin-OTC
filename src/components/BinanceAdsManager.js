import React, { useState, useEffect } from 'react';

const BinanceAdsManager = () => {
  const [ads, setAds] = useState([]);
  const [botActive, setBotActive] = useState(false);

  useEffect(() => {
    const fetchAds = async () => {
      const response = await fetch('/api/get-my-ads');
      const data = await response.json();
      if (response.ok) {
        setAds(data);
      } else {
        console.error('Error al obtener los anuncios:', data.error);
      }
    };

    fetchAds();
  }, []);

  const toggleBot = () => {
    setBotActive(!botActive);
    // Aquí puedes añadir la lógica para iniciar o detener el bot
  };

  return (
    <div>
      <h2>Mis Anuncios en Binance P2P</h2>
      <button onClick={toggleBot}>
        {botActive ? 'Detener Bot' : 'Iniciar Bot'}
      </button>
      <ul>
        {ads.map((ad) => (
          <li key={ad.advNo}>
            {ad.asset}: {ad.price} {ad.fiatUnit}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BinanceAdsManager;
