// components/OperationTab.js
import React, { useState } from 'react';

const OperationTab = () => {
  const [mode, setMode] = useState('cliente'); // 'cliente' | 'operador'
  const [deposit, setDeposit] = useState('');      // Monto depositado (MXN)
  const [tc, setTc] = useState('');                // Tipo de cambio (USDT/MXN) para clientes
  const [networkFee, setNetworkFee] = useState(''); // Comisión en USDT

  // Campos extra para OPERADOR
  const [spotPrice, setSpotPrice] = useState('');    // Precio spot
  const [buyPrice, setBuyPrice] = useState('');      // Precio de compra
  const [sellFactor, setSellFactor] = useState('');  // Coeficiente de venta (por ejemplo, *.002)
  const [clientName, setClientName] = useState('');  // Nombre de cliente (solo operador)

  // Cálculo para modo CLIENTE
  const calcClientAmount = () => {
    const dep = parseFloat(deposit) || 0;
    const rate = parseFloat(tc) || 1;
    const fee = parseFloat(networkFee) || 0;
    return dep / rate - fee;
  };

  // Cálculo para modo OPERADOR
  const calcOperatorAmount = () => {
    const dep = parseFloat(deposit) || 0;
    const bp = parseFloat(buyPrice) || 1;
    const coef = parseFloat(sellFactor) || 1;
    const fee = parseFloat(networkFee) || 0;
    return (dep / bp) * coef - fee;
  };

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Operación / Cotizador MXN–USDT</h2>

      {/* Selector de modo */}
      <div className="mb-6">
        <span className="mr-4 font-medium">Modo:</span>
        <button
          onClick={() => setMode('cliente')}
          className={`px-4 py-2 rounded-l-full border ${
            mode==='cliente' 
              ? 'bg-black text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Cliente
        </button>
        <button
          onClick={() => setMode('operador')}
          className={`px-4 py-2 rounded-r-full border ${
            mode==='operador'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Operador
        </button>
      </div>

      {/* Tabla de entrada y resultados */}
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
            <td className="p-2">CCY Depositado</td>
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

          {/* CLIENTE usa TC; OPERADOR muestra Spot + compra */}
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
                <td className="p-2">P. de compra</td>
                <td className="p-2 text-right">
                  <input
                    type="number"
                    value={buyPrice}
                    onChange={e => setBuyPrice(e.target.value)}
                    className="w-full text-right px-2 py-1 border rounded"
                    placeholder="MXN/USDT"
                  />
                </td>
                <td className="p-2">MXN/USDT</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">C. de venta</td>
                <td className="p-2 text-right">
                  <input
                    type="number"
                    value={sellFactor}
                    onChange={e => setSellFactor(e.target.value)}
                    className="w-full text-right px-2 py-1 border rounded"
                    placeholder="Ej: 1.002"
                  />
                </td>
                <td className="p-2">mxn/usdt</td>
              </tr>
            </>
          )}

          {/* Comisión de RED (ambos modos) */}
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

          {/* Campo extra: Cliente (solo operador) */}
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

        {/* Resultado */}
        <tfoot>
          <tr className="bg-black text-white">
            <td className="p-2 font-bold">Cantidad</td>
            <td className="p-2 text-right font-bold">
              {mode === 'cliente'
                ? calcClientAmount().toLocaleString(undefined, { minimumFractionDigits: 6 })
                : calcOperatorAmount().toLocaleString(undefined, { minimumFractionDigits: 6 })
              }
            </td>
            <td className="p-2 font-bold">USDT</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default OperationTab;
