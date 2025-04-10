// components/P2PAdManager.js
import React, { useState, useEffect } from 'react';

const P2PAdManager = () => {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    fetch('/api/get-my-ads')
      .then(res => res.json())
      .then(data => setAds(data));
  }, []);

  const handleUpdate = async (id, price) => {
    await fetch('/api/update-ad-price', {
      method: 'POST',
      body: JSON.stringify({ adId: id, price }),
      headers: { 'Content-Type': 'application/json' }
    });
    alert('Precio actualizado');
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Mis Anuncios</h2>
      {ads.map(ad => (
        <div key={ad.adId} className="p-4 border rounded mb-2">
          <p><strong>Asset:</strong> {ad.asset}</p>
          <p><strong>Precio actual:</strong> ${ad.price}</p>
          <input
            type="number"
            placeholder="Nuevo precio"
            onBlur={(e) => handleUpdate(ad.adId, e.target.value)}
            className="border px-2 py-1 mt-2"
          />
        </div>
      ))}
    </div>
  );
};

export default P2PAdManager;
