import React, { useEffect, useState } from 'react';

const BinanceBotPanel = () => {
  const [ads, setAds] = useState([]);
  const [botActive, setBotActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchAds = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/get-my-ads');
      const data = await res.json();

      if (Array.isArray(data.data)) {
        setAds(data.data);
        setLastUpdate(new Date().toLocaleTimeString());
      } else {
        setAds([]);
        setError('No se encontraron anuncios activos.');
      }
    } catch (err) {
      setAds([]);
      setError('Error de conexión al cargar los anuncios.');
    } finally {
      setLoading(false);
    }
  };

  const updatePrice = async (adId, newPrice) => {
    await fetch('/api/update-my-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, price: newPrice }),
    });
  };

  const simulateLowestPrice = async () => {
    for (const ad of ads) {
      const newPrice = (Number(ad.price) - 0.01).toFixed(2);
      await updatePrice(ad.advertisementId, newPrice);
    }
  };

  useEffect(() => {
    fetchAds(); // carga inicial

    if (botActive) {
      const interval = setInterval(() => {
        fetchAds();
        simulateLowestPrice();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [botActive]);

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Bot de Precio Más Bajo (Binance P2P)</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchAds}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            🔄 Refrescar
          </button>
          <button
            onClick={() => setBotActive(!botActive)}
            className={`px-3 py-1 text-sm rounded text-white ${botActive ? 'bg-red-600' : 'bg-green-600'}`}
          >
            {botActive ? 'Detener Bot' : 'Activar Bot'}
          </button>
        </div>
      </div>

      {lastUpdate && (
        <p className="text-sm text-gray-500 mb-2">Última sincronización: {lastUpdate}</p>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Cargando anuncios...</p>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : ads.length === 0 ? (
        <p className="text-gray-500 text-sm">No se encontraron anuncios.</p>
      ) : (
        <table className="w-full text-sm mt-4">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">ID</th>
              <th className="p-2">Activo</th>
              <th className="p-2">Precio</th>
            </tr>
          </thead>
          <tbody>
            {ads.map((ad) => (
              <tr key={ad.advertisementId} className="border-b">
                <td className="p-2">{ad.advertisementId}</td>
                <td className="p-2">{ad.asset}</td>
                <td className="p-2">${ad.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BinanceBotPanel;
