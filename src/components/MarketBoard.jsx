import React, { useEffect, useState } from 'react';

const PAIRS = [
  { book: 'btc_mxn', label: 'BTC/MXN' },
  { book: 'eth_mxn', label: 'ETH/MXN' },
  { book: 'usdt_mxn', label: 'USDT/MXN' }
];

const MarketBoard = () => {
  const [prices, setPrices] = useState({});
  const [prevPrices, setPrevPrices] = useState({});

  const fetchPrices = async () => {
    try {
      const responses = await Promise.all(
        PAIRS.map(pair =>
          fetch(`https://api.bitso.com/v3/ticker/?book=${pair.book}`).then(res => res.json())
        )
      );

      const newPrices = {};
      responses.forEach((res, index) => {
        const pair = PAIRS[index].book;
        const lastPrice = parseFloat(res.payload.last);
        const volume = parseFloat(res.payload.volume);
        newPrices[pair] = {
          last: lastPrice,
          volume,
        };
      });

      setPrevPrices(prices);
      setPrices(newPrices);
    } catch (error) {
      console.error('Error al cargar precios de Bitso:', error);
    }
  };

  useEffect(() => {
    fetchPrices(); // carga inicial
    const interval = setInterval(fetchPrices, 3000); // cada 3 segundos
    return () => clearInterval(interval);
  }, [prices]);

  const renderChange = (pair) => {
    const prev = prevPrices[pair]?.last;
    const current = prices[pair]?.last;
    if (!prev || !current) return null;

    if (current > prev) return <span className="text-green-600">⬆</span>;
    if (current < prev) return <span className="text-red-600">⬇</span>;
    return <span className="text-gray-500">→</span>;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {PAIRS.map(({ book, label }) => {
        const price = prices[book]?.last?.toLocaleString(undefined, { minimumFractionDigits: 2 });
        const volume = prices[book]?.volume?.toLocaleString(undefined, { minimumFractionDigits: 2 });
        const color =
          prevPrices[book] && prices[book]
            ? prices[book].last > prevPrices[book].last
              ? 'text-green-600'
              : prices[book].last < prevPrices[book].last
              ? 'text-red-600'
              : 'text-gray-800'
            : 'text-gray-800';

        return (
          <div
            key={book}
            className="bg-white shadow-md rounded-xl p-4 flex flex-col justify-between"
          >
            <h2 className="text-lg font-semibold mb-2">{label}</h2>
            <div className={`text-2xl font-bold ${color}`}>
              ${price} {renderChange(book)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Volumen 24h: {volume}</div>
          </div>
        );
      })}
    </div>
  );
};

export default MarketBoard;
