import React, { useState } from 'react';

const OperationTab = () => {
  const [mode, setMode] = useState('cliente'); // 'cliente' | 'operador'
  const [deposit, setDeposit] = useState('');       // Monto depositado (MXN)
  const [tc, setTc] = useState('');                 // Tipo de cambio (USDT/MXN) para clientes
  const [networkFee, setNetworkFee] = useState(''); // Comisión en USDT

  // Campos extra para OPERADOR
  const [spotPrice, setSpotPrice]     = useState(''); // Precio spot
  const [clientName, setClientName]   = useState(''); // Nombre de cliente (solo operador)

  // Cálculo para modo CLIENTE
  const calcClientAmount = () => {
    const dep = parseFloat(deposit) || 0;
    const rate = parseFloat(tc) || 1;
    const fee = parseFloat(networkFee) || 0;
    return dep / rate - fee;
  };

  // Cálculo para modo OPERADOR
  // aquí buyPrice = spotPrice + .02, sellFactor fijo -> 1.005
  const buyPrice  = parseFloat(spotPrice) > 0
    ? parseFloat(spotPrice) + 0.02
    : 0;
  const sellFactor = 1.05; // +5 centavos
  const calcOperatorAmount = () => {
    const dep = parseFloat(deposit) || 0;
    const fee = parseFloat(networkFee) || 0;
    return dep / buyPrice * sellFactor - fee;
  };

  return (
    <div className="bg-white shadow rounded-xl p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Operación / Cotizador MXN–USDT</h2>

      {/* Selector de modo */}
      <div className="mb-6 inline-flex rounded-full overflow-hidden border">
        <button
          onClick={() => setMode('cliente')}
          className={`px-4 py-2 transition ${
            mode==='cliente'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Cliente
        </button>
        <button
          onClick={() => setMode('operador')}
          className={`px-4 py-2 transition ${
            mode==='operador'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Operador
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-purple-600 text-white">
            <th className="p-2">Concepto</th>
            <th className="p-2 text-right">$</th>
            <th className="p-2">Base</th>
          </tr>
        </thead>
        <tbody>
          {/* Depósito */}
          <tr className="border-b">
            <td className="p-2">MXN Depositado</td>
            <td className="p-2 text-right">
              <input
                type="number"
                value={deposit}
                onChange={e => setDeposit(e.target.value)}
                className="w-full text-right px-2 py-1 border rounded"
                placeholder="MXN"
              />
            </td>
            <td className="p-2">MXN</td>
          </tr>

          {/* TC vs P. Spot + P. Compra */}
          {mode === 'cliente' ? (
            <tr className="border-b">
              <td className="p-2">TC</td>
              <td className="p-2 text-right">
                <input
                  type="number"
                  value={tc}
                  onChange={e => setTc(e.target.value)}
                  className="w-full text-right px-2 py-1 border rounded"
                  placeholder="USDT/MXN"
                />
              </td>
              <td className="p-2">USDT/MXN</td>
            </tr>
          ) : (
            <>
              <tr className="border-b">
                <td className="p-2">P. Spot</td>
                <td className="p-2 text-right">
                  <input
                    type="number"
                    value={spotPrice}
                    onChange={e => setSpotPrice(e.target.value)}
                    className="w-full text-right px-2 py-1 border rounded"
                    placeholder="MXN/USDT"
                  />
                </td>
                <td className="p-2">MXN/USDT</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">P. Compra (+0.02)</td>
                <td className="p-2 text-right">{buyPrice.toFixed(3)}</td>
                <td className="p-2">MXN/USDT</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">C. Venta (+0.05)</td>
                <td className="p-2 text-right">{(sellFactor).toFixed(3)}</td>
                <td className="p-2">MXN/USDT</td>
              </tr>
            </>
          )}

          {/* Comisión de RED */}
          <tr className="border-b">
            <td className="p-2">C. de RED</td>
            <td className="p-2 text-right">
              <input
                type="number"
                value={networkFee}
                onChange={e => setNetworkFee(e.target.value)}
                className="w-full text-right px-2 py-1 border rounded"
                placeholder="USDT"
              />
            </td>
            <td className="p-2">USDT</td>
          </tr>

          {/* Cliente (solo operador) */}
          {mode === 'operador' && (
            <tr className="bg-purple-100">
              <td className="p-2 font-semibold">Cliente</td>
              <td className="p-2 text-right">
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full text-right px-2 py-1 border rounded"
                  placeholder="Nombre"
                />
              </td>
              <td className="p-2"></td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="bg-black text-white">
            <td className="p-2 font-bold">Cantidad</td>
            <td className="p-2 text-right font-bold">
              {(mode === 'cliente'
                ? calcClientAmount()
                : calcOperatorAmount()
              ).toLocaleString(undefined, { minimumFractionDigits: 6 })}
            </td>
            <td className="p-2 font-bold">USDT</td>
          </tr>
        </tfoot>
      </table>
    </div>
);

export default OperationTab;
